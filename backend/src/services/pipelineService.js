const env = require('../config/env');
const { cacheService, generateKey } = require('./cacheService');
const logger = require('../utils/logger');

// Cache definitions
const PIPELINES_TTL = 600; // 10 minutes
const BUILDS_TTL = 60;     // 1 minute

const pipelineService = {
  /**
   * Retrieves all pipelines in the configured project.
   * 
   * @param {object} req Express request context
   * @returns {Promise<object[]>} List of pipeline definitions
   */
  getPipelines: async (req) => {
    const cacheKey = generateKey(req.azurePat, 'pipelines');
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      logger.info('Serving pipelines list from cache.');
      return cachedData;
    }

    const client = req.getCoreClient();
    const startTime = Date.now();

    try {
      const response = await client.get(`/${env.AZURE_PROJECT}/_apis/pipelines`);
      const pipelines = response.data.value || [];

      const formatted = pipelines.map(pipe => ({
        id: pipe.id,
        name: pipe.name,
        folder: pipe.folder || '/',
        type: pipe.configuration?.type || 'yaml',
        url: pipe.url
      })).sort((a, b) => Number(a.id) - Number(b.id));

      const duration = Date.now() - startTime;
      logger.info(`Pipelines retrieved from Azure DevOps: found ${formatted.length} configurations`, duration);

      cacheService.set(cacheKey, formatted, PIPELINES_TTL);
      return formatted;
    } catch (error) {
      logger.error('Failed to retrieve pipelines list from Azure DevOps', error);
      throw error;
    }
  },

  /**
   * Retrieves history list of builds in the configured project.
   * Supports pipeline ID and status/result filtering.
   * 
   * @param {object} req Express request context
   * @param {object} filters Query parameters for filtering builds
   * @returns {Promise<object[]>} Formatted build run logs
   */
  getBuilds: async (req, filters = {}) => {
    const cacheKey = generateKey(req.azurePat, 'builds', filters);
    const cachedData = cacheService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const client = req.getCoreClient();
    const startTime = Date.now();

    const params = {
      maxBuilds: parseInt(filters.limit, 10) || 50,
      queryOrder: 'finishTimeDescending'
    };

    if (filters.pipelineId) params.definitions = filters.pipelineId;
    if (filters.status) params.statusFilter = filters.status;
    if (filters.result) params.resultFilter = filters.result;

    try {
      const response = await client.get(`/${env.AZURE_PROJECT}/_apis/build/builds`, { params });
      const builds = response.data.value || [];

      const formatted = builds.map(b => ({
        id: b.id,
        buildNumber: b.buildNumber,
        status: b.status,
        result: b.result,
        queueTime: b.queueTime,
        startTime: b.startTime,
        finishTime: b.finishTime,
        url: b._links?.web?.href || b.url,
        pipeline: {
          id: b.definition?.id,
          name: b.definition?.name
        },
        branch: b.sourceBranch ? b.sourceBranch.replace('refs/heads/', '') : '',
        commit: b.sourceVersion ? b.sourceVersion.substring(0, 7) : ''
      }));

      const duration = Date.now() - startTime;
      logger.info(`Builds history retrieved: fetched ${formatted.length} build runs`, duration);

      cacheService.set(cacheKey, formatted, BUILDS_TTL);
      return formatted;
    } catch (error) {
      logger.error('Failed to retrieve builds history from Azure DevOps', error);
      throw error;
    }
  }
};

module.exports = pipelineService;
