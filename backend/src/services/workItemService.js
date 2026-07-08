const env = require('../config/env');
const azureService = require('./azureService');
const { cacheService, generateKey } = require('./cacheService');
const logger = require('../utils/logger');

// Cache work items for 5 minutes (300 seconds)
const WORKITEMS_TTL = 300;

const workItemService = {
  /**
   * Retrieves work items from Azure DevOps and maps them to the dashboard schema.
   * 
   * @param {object} req Express request context
   * @returns {Promise<object[]>} List of formatted work items
   */
  getWorkItems: async (req) => {
    const cacheKey = generateKey(req.azurePat, 'work_items');
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      logger.info('Serving work items from cache.');
      return cachedData;
    }

    const client = req.getCoreClient();
    const startTime = Date.now();

    // Query for standard DevOps work item types (Feature, User Story, Task, Bug)
    const wiqlQuery = `
      SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State], [System.CreatedDate], [System.AssignedTo]
      FROM WorkItems
      WHERE [System.TeamProject] = '${env.AZURE_PROJECT}'
        AND [System.WorkItemType] IN ('Feature', 'User Story', 'Task', 'Bug', 'Epic')
      ORDER BY [System.ChangedDate] DESC
    `;

    try {
      // 1. Get matching IDs
      const ids = await azureService.executeWIQL(client, wiqlQuery);
      
      // Limit to top 100 recent work items to keep API payload size optimized
      const recentIds = ids.slice(0, 100);

      // 2. Fetch details in batches
      const detailedItems = await azureService.fetchWorkItemsBatch(client, recentIds);

      // 3. Map details to standard dashboard WorkItem structure
      const formatted = detailedItems.map(item => {
        const fields = item.fields;
        const createdDate = new Date(fields['System.CreatedDate']);
        const closedDate = fields['Microsoft.VSTS.Common.ClosedDate'] ? new Date(fields['Microsoft.VSTS.Common.ClosedDate']) : null;
        
        let leadTimeDays = null;
        if (closedDate) {
          leadTimeDays = parseFloat(((closedDate - createdDate) / (1000 * 60 * 60 * 24)).toFixed(1));
        }

        // Map status state to frontend matches: done, in_progress, todo
        const rawState = fields['System.State'] || 'New';
        let status = 'todo';
        if (['Done', 'Closed', 'Resolved', 'Completed'].includes(rawState)) {
          status = 'done';
        } else if (['Active', 'In Progress', 'Approved', 'Committed', 'Development'].includes(rawState)) {
          status = 'in_progress';
        }

        // Map work item type to lowercase
        const rawType = fields['System.WorkItemType'] || 'Task';
        let type = 'chore';
        if (rawType === 'Bug') type = 'bug';
        else if (rawType === 'Feature') type = 'feature';
        else if (rawType === 'Task') type = 'chore';
        else if (rawType === 'User Story') type = 'feature';

        // Map priority
        const priorityVal = fields['Microsoft.VSTS.Common.Priority'] || 3;
        let priority = 'medium';
        if (priorityVal === 1) priority = 'high';
        else if (priorityVal === 4) priority = 'low';

        // Map assignee
        const assigneeObj = fields['System.AssignedTo'];
        const assigneeName = assigneeObj ? assigneeObj.displayName : 'Unassigned';

        return {
          id: `WRK-${item.id}`,
          title: fields['System.Title'] || 'Untitled Work Item',
          type: type,
          status: status,
          leadTime: leadTimeDays,
          priority: priority,
          assignee: assigneeName,
          timestamp: fields['System.ChangedDate'] || fields['System.CreatedDate'] || new Date().toISOString()
        };
      });

      const duration = Date.now() - startTime;
      logger.info(`Work items compiled: found ${formatted.length} items`, duration);

      cacheService.set(cacheKey, formatted, WORKITEMS_TTL);
      return formatted;
    } catch (error) {
      logger.error('Failed to retrieve work items list', error);
      throw error;
    }
  }
};

module.exports = workItemService;
