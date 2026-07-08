const metricsService = require('../services/metricsService');
const deploymentService = require('../services/deploymentService');
const incidentService = require('../services/incidentService');
const logger = require('../utils/logger');

const dashboardController = {
  /**
   * Aggregates telemetry metrics, historic charts, deployments, and outages
   * into a single overview payload.
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  getDashboardSummary: async (req, res, next) => {
    const startTime = Date.now();
    const { dateRange, environment } = req.query;

    try {
      // Fetch DORA metrics, trend charts, recent deployments, and incidents in parallel
      const period = dateRange === '30d' || dateRange === '90d' || dateRange === 'all' ? 'monthly' : 'weekly';
      
      const [metrics, trends, deploymentsData, incidentsData] = await Promise.all([
        metricsService.getMetrics(req, { dateRange, environment }),
        metricsService.getTrends(req, period),
        deploymentService.getDeployments(req, { dateRange, environment, page: 1, limit: 5 }),
        incidentService.getIncidents(req, { dateRange, environment, page: 1, limit: 5 })
      ]);

      const summary = {
        metrics,
        trends,
        deployments: deploymentsData,
        incidents: incidentsData
      };

      const duration = Date.now() - startTime;
      logger.info('Dashboard aggregate summary compiled successfully.', duration);

      res.status(200).json({
        success: true,
        message: 'Dashboard aggregate data compiled successfully.',
        data: summary,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;
