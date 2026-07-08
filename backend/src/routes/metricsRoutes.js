const express = require('express');
const metricsController = require('../controllers/metricsController');
const { validateMetricsFilters } = require('../middleware/validation');
const router = express.Router();

// Base metrics calculations
router.get('/', validateMetricsFilters, metricsController.getMetrics);

// Trends (weekly/monthly)
router.get('/trends/:period', metricsController.getTrends);

// Individual DORA metric queries
router.get('/deployment-frequency', validateMetricsFilters, metricsController.getDeploymentFrequency);
router.get('/lead-time', validateMetricsFilters, metricsController.getLeadTime);
router.get('/change-failure-rate', validateMetricsFilters, metricsController.getChangeFailureRate);
router.get('/mttr', validateMetricsFilters, metricsController.getMttr);

module.exports = router;
