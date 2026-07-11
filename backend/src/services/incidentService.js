const env = require('../config/env');
const azureService = require('./azureService');
const { cacheService, generateKey } = require('./cacheService');
const logger = require('../utils/logger');
const { getDateRangeStart } = require('../utils/dateUtils');

// Cache incidents for 1 minute (60 seconds)
const INCIDENTS_TTL = 60;

/**
 * Maps frontend severity string (critical, major, minor) to Azure DevOps Priority integer (1, 2, 3).
 */
const severityToPriority = (severity) => {
  if (!severity) return 3;
  switch (severity.toLowerCase()) {
    case 'critical': return 1;
    case 'major': return 2;
    case 'minor':
    default:
      return 3;
  }
};

/**
 * Maps Azure DevOps Priority integer (1, 2, 3) to frontend severity string.
 */
const priorityToSeverity = (priority) => {
  if (priority === 1) return 'critical';
  if (priority === 2) return 'major';
  return 'minor';
};

const incidentService = {
  /**
   * Retrieves incidents (Outage/Incident bugs) from Azure DevOps.
   * Maps detailed fields, parses metadata from tags, and returns paginated results.
   * 
   * @param {object} req Express request context
   * @param {object} filters Query filters (page, limit, severity, status, environment, search)
   * @returns {Promise<object>} Paginated list of incidents and pagination metadata
   */
  getIncidents: async (req, filters = {}) => {
    const cacheKey = generateKey(req.azurePat, 'incidents_ledger', filters);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      logger.info('Serving incidents ledger from cache.');
      return cachedData;
    }

    const client = req.getCoreClient();
    const startTime = Date.now();

    // Query for configured work item type and map real Azure Boards bugs/incidents.
    const wiqlQuery = `
      SELECT [System.Id]
      FROM WorkItems
      WHERE [System.TeamProject] = '${env.AZURE_PROJECT}'
        AND [System.WorkItemType] = '${env.AZURE_INCIDENT_WORK_ITEM_TYPE}'
      ORDER BY [System.CreatedDate] DESC
    `;

    try {
      let ids = [];
      try {
        ids = await azureService.executeWIQL(client, wiqlQuery);
      } catch (wiqlErr) {
        logger.warn('Failed to query work items via WIQL: ' + wiqlErr.message);
      }

      const detailedItems = ids.length > 0 ? await azureService.fetchWorkItemsBatch(client, ids) : [];

      const mappedAzure = detailedItems.map(item => {
        const fields = item.fields;
        const state = fields['System.State'] || 'New';
        
        // Map State to status: resolved vs. investigating
        const isResolved = ['Closed', 'Resolved', 'Done', 'Completed'].includes(state);
        const status = isResolved ? 'resolved' : 'investigating';

        const createdDate = new Date(fields['System.CreatedDate']);
        const resolvedDate = fields['Microsoft.VSTS.Common.ClosedDate'] 
          ? new Date(fields['Microsoft.VSTS.Common.ClosedDate']) 
          : fields['Microsoft.VSTS.Common.StateChangeDate'] && isResolved
            ? new Date(fields['Microsoft.VSTS.Common.StateChangeDate'])
            : null;

        let durationMins = 0;
        if (resolvedDate) {
          durationMins = Math.max(1, Math.floor((resolvedDate - createdDate) / 60000));
        } else if (!isResolved) {
          durationMins = Math.max(1, Math.floor((Date.now() - createdDate) / 60000));
        }

        const tagsStr = fields['System.Tags'] || '';
        const tags = tagsStr.split(/[;,]/).map(t => t.trim()).filter(Boolean);
        const otherTags = tags.filter(t => t.toLowerCase() !== 'incident');
        const pipelineName = otherTags[0] || '';
        const envName = otherTags[1] || '';

        return {
          id: `INC-${item.id}`,
          title: fields['System.Title'] || '',
          severity: priorityToSeverity(fields['Microsoft.VSTS.Common.Priority']),
          status: status,
          pipeline: pipelineName,
          environment: envName,
          detectedAt: fields['System.CreatedDate'] || '',
          resolvedAt: resolvedDate ? resolvedDate.toISOString() : null,
          duration: isResolved ? durationMins : null,
          description: fields['System.Description'] || '',
          actionItems: []
        };
      });

      // Return mapped Azure incidents
      let list = [...mappedAzure];

      // Apply dateRange filter if present
      if (filters.dateRange) {
        const start = getDateRangeStart(filters.dateRange);
        if (start) {
          list = list.filter(i => {
            const time = new Date(i.detectedAt).getTime();
            return time >= start.getTime();
          });
        }
      }

      // Apply Filters
      if (filters.severity && filters.severity !== 'All') {
        const sevFilter = filters.severity.toLowerCase();
        list = list.filter(i => i.severity.toLowerCase() === sevFilter);
      }
      if (filters.status && filters.status !== 'All') {
        const statFilter = filters.status.toLowerCase();
        list = list.filter(i => i.status.toLowerCase() === statFilter);
      }
      if (filters.environment && filters.environment !== 'All') {
        const envFilter = filters.environment.toLowerCase();
        list = list.filter(i => i.environment.toLowerCase() === envFilter);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(i => 
          i.id.toLowerCase().includes(q) ||
          (i.title && i.title.toLowerCase().includes(q)) ||
          (i.pipeline && i.pipeline.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q))
        );
      }

      // Pagination
      const page = parseInt(filters.page, 10) || 1;
      const limit = parseInt(filters.limit, 10) || 5;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const paginatedList = list.slice(startIndex, endIndex);
      const total = list.length;
      const pages = Math.ceil(total / limit);

      const result = {
        data: paginatedList,
        pagination: {
          total,
          page,
          limit,
          pages
        }
      };

      const duration = Date.now() - startTime;
      logger.info(`Incidents ledger compiled: ${total} items total (page ${page}/${pages})`, duration);

      cacheService.set(cacheKey, result, INCIDENTS_TTL);
      return result;
    } catch (error) {
      logger.error('Failed to retrieve incidents list', error);
      throw error;
    }
  },

  /**
   * Registers a new incident in Azure DevOps by creating a work item of the configured type.
   * Tags the work item with 'Incident' and sets pipeline/environment details.
   * 
   * @param {object} req Express request context
   * @param {object} incidentData Incident attributes (title, severity, environment, pipeline, description)
   * @returns {Promise<object>} Newly created incident entity
   */
  createIncident: async (req, incidentData) => {
    const client = req.getCoreClient();
    const startTime = Date.now();

    const { title, severity, environment, pipeline, description } = incidentData;
    const priority = severityToPriority(severity);

    // JSON Patch document to create work item
    const patchBody = [
      {
        op: 'add',
        path: '/fields/System.Title',
        value: title
      },
      {
        op: 'add',
        path: '/fields/System.Description',
        value: description || ''
      },
      {
        op: 'add',
        path: '/fields/Microsoft.VSTS.Common.Priority',
        value: priority
      },
      {
        op: 'add',
        path: '/fields/System.Tags',
        value: `Incident; ${pipeline || 'Service-Core'}; ${environment || 'Production'}`
      }
    ];

    try {
      // Invalidate caches immediately
      cacheService.invalidate(req.azurePat, 'incidents_ledger');
      cacheService.invalidate(req.azurePat, 'dashboard_summary');
      cacheService.invalidate(req.azurePat, 'metrics');

      try {
        const response = await client.post(
          `/${env.AZURE_PROJECT}/_apis/wit/workitems/$${env.AZURE_INCIDENT_WORK_ITEM_TYPE}?api-version=${env.AZURE_API_VERSION}`,
          patchBody,
          {
            headers: {
              'Content-Type': 'application/json-patch+json'
            }
          }
        );

        const newItem = response.data;
        const duration = Date.now() - startTime;
        logger.info(`Successfully created incident bug (ID: ${newItem.id}) in Azure DevOps`, duration);

        return {
          id: `INC-${newItem.id}`,
          title: title,
          severity: severity,
          status: 'investigating',
          pipeline: pipeline,
          environment: environment,
          detectedAt: newItem.fields['System.CreatedDate'] || new Date().toISOString(),
          resolvedAt: null,
          duration: null,
          description: description || '',
          actionItems: []
        };
      } catch (witError) {
        logger.warn(`Azure DevOps work item creation failed: ${witError.message}`);
        throw witError;
      }
    } catch (error) {
      logger.error('Failed to create incident bug', error);
      throw error;
    }
  },

  /**
   * Resolves an incident bug in Azure DevOps by moving its state to 'Resolved' or 'Closed'.
   * 
   * @param {object} req Express request context
   * @param {string} incidentId Work item ID (can contain "INC-" prefix)
   * @returns {Promise<object>} Updated incident entity
   */
  resolveIncident: async (req, incidentId) => {
    const client = req.getCoreClient();
    const startTime = Date.now();

    // Strip out the "INC-" prefix if present
    const numericId = incidentId.replace('INC-', '');

    // JSON Patch to resolve work item. We try "Resolved" first. 
    const patchBody = [
      {
        op: 'add',
        path: '/fields/System.State',
        value: 'Resolved'
      }
    ];

    try {
      // Invalidate caches immediately
      cacheService.invalidate(req.azurePat, 'incidents_ledger');
      cacheService.invalidate(req.azurePat, 'dashboard_summary');
      cacheService.invalidate(req.azurePat, 'metrics');

      try {
        response = await client.patch(
          `/${env.AZURE_PROJECT}/_apis/wit/workitems/${numericId}?api-version=${env.AZURE_API_VERSION}`,
          patchBody,
          {
            headers: {
              'Content-Type': 'application/json-patch+json'
            }
          }
        );
      } catch {
        // If "Resolved" is not a valid transition, try moving to "Closed" or "Done"
        logger.warn(`Failed to set state to "Resolved" for item ${numericId}. Retrying with "Closed"...`);
        patchBody[0].value = 'Closed';
        try {
          response = await client.patch(
            `/${env.AZURE_PROJECT}/_apis/wit/workitems/${numericId}?api-version=${env.AZURE_API_VERSION}`,
            patchBody,
            {
              headers: {
                'Content-Type': 'application/json-patch+json'
              }
            }
          );
        } catch (closeErr) {
          logger.warn(`Failed to set state to "Closed" for item ${numericId}. Retrying with "Done"...`);
          patchBody[0].value = 'Done';
          try {
            response = await client.patch(
              `/${env.AZURE_PROJECT}/_apis/wit/workitems/${numericId}?api-version=${env.AZURE_API_VERSION}`,
              patchBody,
              {
                headers: {
                  'Content-Type': 'application/json-patch+json'
                }
              }
            );
          } catch (doneErr) {
            logger.warn(`Azure DevOps work item resolution failed for ID ${incidentId} on all state fallbacks (Resolved, Closed, Done): ${doneErr.message}`);
            throw doneErr;
          }
        }
      }

      const updatedItem = response.data;
      const fields = updatedItem.fields;
      
      const createdDate = new Date(fields['System.CreatedDate']);
      const resolvedDate = new Date(fields['Microsoft.VSTS.Common.StateChangeDate'] || fields['System.ChangedDate'] || Date.now());
      const durationMins = Math.max(1, Math.floor((resolvedDate - createdDate) / 60000));

      const tagsStr = fields['System.Tags'] || '';
      const tags = tagsStr.split(/[;,]/).map(t => t.trim()).filter(Boolean);
      const otherTags = tags.filter(t => t.toLowerCase() !== 'incident');
      const pipelineName = otherTags[0] || '';
      const envName = otherTags[1] || '';

      const duration = Date.now() - startTime;
      logger.info(`Successfully resolved incident work item (ID: ${numericId}) in Azure DevOps`, duration);

      return {
        id: `INC-${updatedItem.id}`,
        title: fields['System.Title'] || '',
        severity: priorityToSeverity(fields['Microsoft.VSTS.Common.Priority']),
        status: 'resolved',
        pipeline: pipelineName,
        environment: envName,
        detectedAt: fields['System.CreatedDate'],
        resolvedAt: resolvedDate.toISOString(),
        duration: durationMins,
        description: fields['System.Description'] || '',
        actionItems: []
      };
    } catch (error) {
      logger.error(`Failed to resolve incident work item ${numericId} in Azure DevOps`, error);
      throw error;
    }
  }
};

module.exports = incidentService;
