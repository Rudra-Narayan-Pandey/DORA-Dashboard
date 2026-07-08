const { cacheService, generateKey } = require('./cacheService');
const logger = require('../utils/logger');

// Cache projects for 1 hour (3600 seconds)
const PROJECTS_CACHE_TTL = 3600;

const projectService = {
  /**
   * Retrieves all projects in the organization.
   * Checks the cache first.
   * 
   * @param {object} req Express request object containing dynamic clients
   * @returns {Promise<object[]>} List of project entities
   */
  getProjects: async (req) => {
    const cacheKey = generateKey(req.azurePat, 'projects');
    const cachedData = cacheService.get(cacheKey);
    
    if (cachedData) {
      logger.info('Serving projects list from cache.');
      return cachedData;
    }

    const client = req.getCoreClient();
    const startTime = Date.now();
    
    try {
      // Projects list is organizational level
      const response = await client.get('/_apis/projects');
      const projects = response.data.value || [];
      
      const formattedProjects = projects.map(proj => ({
        id: proj.id,
        name: proj.name,
        description: proj.description || '',
        state: proj.state,
        visibility: proj.visibility,
        lastUpdateTime: proj.lastUpdateTime
      }));

      const duration = Date.now() - startTime;
      logger.info(`Projects list retrieved from Azure DevOps: found ${formattedProjects.length} items`, duration);

      // Cache the result
      cacheService.set(cacheKey, formattedProjects, PROJECTS_CACHE_TTL);
      return formattedProjects;
    } catch (error) {
      logger.error('Failed to retrieve projects list from Azure DevOps', error);
      throw error;
    }
  }
};

module.exports = projectService;
