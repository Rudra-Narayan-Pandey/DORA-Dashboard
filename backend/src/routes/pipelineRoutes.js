const express = require('express');
const pipelineController = require('../controllers/pipelineController');
const { validatePagination } = require('../middleware/validation');
const router = express.Router();

// GET /api/pipelines
router.get('/', pipelineController.getPipelines);

// GET /api/builds
// Also mounted in server/app.js directly on /api/builds to satisfy top-level requirements
router.get('/builds', validatePagination, pipelineController.getBuilds);

module.exports = router;
