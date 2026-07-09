const metricsService = require('../services/metricsService');

const metricsController = {
  /**
   * Retrieves aggregated DORA metrics.
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  getMetrics: async (req, res, next) => {
    try {
      const { dateRange, environment } = req.query;
      const data = await metricsService.getMetrics(req, { dateRange, environment });
      
      res.status(200).json({
        success: true,
        message: 'DORA metrics calculated successfully.',
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  getTrends: async (req, res, next) => {
    try {
      const { period } = req.params;
      const data = await metricsService.getTrends(req, period, req.query);
      
      res.status(200).json({
        success: true,
        message: `Metrics trends for period "${period}" compiled successfully.`,
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves individual Deployment Frequency metric.
   */
  getDeploymentFrequency: async (req, res, next) => {
    try {
      const { dateRange, environment } = req.query;
      const metrics = await metricsService.getMetrics(req, { dateRange, environment });
      
      res.status(200).json({
        success: true,
        message: 'Deployment frequency metric calculated.',
        data: metrics.deploymentFrequency,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves individual Lead Time metric.
   */
  getLeadTime: async (req, res, next) => {
    try {
      const { dateRange, environment } = req.query;
      const metrics = await metricsService.getMetrics(req, { dateRange, environment });
      
      res.status(200).json({
        success: true,
        message: 'Lead time for changes metric calculated.',
        data: metrics.leadTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves individual Change Failure Rate metric.
   */
  getChangeFailureRate: async (req, res, next) => {
    try {
      const { dateRange, environment } = req.query;
      const metrics = await metricsService.getMetrics(req, { dateRange, environment });
      
      res.status(200).json({
        success: true,
        message: 'Change failure rate metric calculated.',
        data: metrics.changeFailureRate,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves individual Mean Time to Restore (MTTR) metric.
   */
  getMttr: async (req, res, next) => {
    try {
      const { dateRange, environment } = req.query;
      const metrics = await metricsService.getMetrics(req, { dateRange, environment });
      
      res.status(200).json({
        success: true,
        message: 'Mean time to restore (MTTR) metric calculated.',
        data: metrics.meanTimeToRestore,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = metricsController;
