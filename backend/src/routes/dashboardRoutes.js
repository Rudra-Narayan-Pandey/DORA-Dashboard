const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { validateMetricsFilters } = require('../middleware/validation');
const router = express.Router();

// GET /api/dashboard
router.get('/', validateMetricsFilters, dashboardController.getDashboardSummary);

module.exports = router;
