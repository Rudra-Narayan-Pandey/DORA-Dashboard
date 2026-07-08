const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Base service wrapper for calling low-level Azure DevOps REST API methods.
 * Implements batching, query parsing, and raw error handling.
 */
const azureService = {
  /**
   * Executes a Work Item Query Language (WIQL) search query.
   * 
   * @param {import('axios').AxiosInstance} client Pre-configured Axios Core API client
   * @param {string} query WIQL Query text
   * @returns {Promise<number[]>} Array of matching Work Item IDs
   */
  executeWIQL: async (client, query) => {
    const startTime = Date.now();
    try {
      const response = await client.post(`/${env.AZURE_PROJECT}/_apis/wit/wiql?api-version=${env.AZURE_API_VERSION}`, { query });
      const duration = Date.now() - startTime;
      
      const workItems = response.data.workItems || [];
      const ids = workItems.map(item => item.id);
      
      logger.info(`WIQL execution completed: found ${ids.length} work items`, duration);
      return ids;
    } catch (error) {
      logger.error('Azure DevOps WIQL query execution failed', error);
      throw error;
    }
  },

  /**
   * Retrieves rich fields and details for a list of work item IDs in batches.
   * Azure DevOps REST API allows up to 200 IDs per request.
   * 
   * @param {import('axios').AxiosInstance} client Pre-configured Axios Core API client
   * @param {number[]} ids Array of work item IDs
   * @returns {Promise<object[]>} Detailed work item objects
   */
  fetchWorkItemsBatch: async (client, ids) => {
    if (!ids || ids.length === 0) return [];
    
    const startTime = Date.now();
    const batchSize = 200;
    const batches = [];
    
    for (let i = 0; i < ids.length; i += batchSize) {
      batches.push(ids.slice(i, i + batchSize));
    }
    
    try {
      const results = await Promise.all(
        batches.map(async (batch) => {
          const idsParam = batch.join(',');
          const response = await client.get(`/${env.AZURE_PROJECT}/_apis/wit/workitems`, {
            params: {
              ids: idsParam,
              $expand: 'all'
            }
          });
          return response.data.value || [];
        })
      );
      
      const detailedItems = results.flat();
      const duration = Date.now() - startTime;
      logger.info(`Fetched details for ${detailedItems.length} work items`, duration);
      return detailedItems;
    } catch (error) {
      logger.error('Azure DevOps batch work items retrieval failed', error);
      throw error;
    }
  }
};

module.exports = azureService;
