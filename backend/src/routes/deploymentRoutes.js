const express = require('express');
const deploymentController = require('../controllers/deploymentController');
const { validatePagination, validateDeploymentTrigger } = require('../middleware/validation');
const router = express.Router();

// GET /api/deployments
router.get('/', validatePagination, deploymentController.getDeployments);

// POST /api/deployments
router.post('/', validateDeploymentTrigger, deploymentController.triggerDeployment);

module.exports = router;
