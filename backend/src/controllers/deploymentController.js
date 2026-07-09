const deploymentService = require('../services/deploymentService');

const deploymentController = {
  /**
   * Retrieves paginated deployment ledger list.
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  getDeployments: async (req, res, next) => {
    try {
      const { page, limit, environment, pipeline, status, search, dateRange } = req.query;
      const data = await deploymentService.getDeployments(req, {
        page,
        limit,
        environment,
        pipeline,
        status,
        search,
        dateRange
      });
      
      res.status(200).json({
        success: true,
        message: 'Deployment ledger compiled successfully.',
        data: {
          data: data.data,
          pagination: data.pagination
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Triggers a new pipeline build or classic release deployment.
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  triggerDeployment: async (req, res, next) => {
    try {
      const { version, environment, pipeline, pipelineId, triggeredBy } = req.body;
      const data = await deploymentService.triggerDeployment(req, {
        version,
        environment,
        pipeline,
        pipelineId,
        triggeredBy
      });
      
      res.status(201).json({
        success: true,
        message: 'Deployment successfully initiated.',
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = deploymentController;
