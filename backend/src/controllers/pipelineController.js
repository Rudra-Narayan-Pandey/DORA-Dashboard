const pipelineService = require('../services/pipelineService');

const pipelineController = {
  /**
   * Retrieves build/YAML pipeline definitions.
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  getPipelines: async (req, res, next) => {
    try {
      const data = await pipelineService.getPipelines(req);
      
      res.status(200).json({
        success: true,
        message: 'Pipeline definitions fetched successfully.',
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves the history of pipeline builds.
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  getBuilds: async (req, res, next) => {
    try {
      const { pipelineId, status, result, limit } = req.query;
      const data = await pipelineService.getBuilds(req, { pipelineId, status, result, limit });
      
      res.status(200).json({
        success: true,
        message: 'Build runs history fetched successfully.',
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = pipelineController;
