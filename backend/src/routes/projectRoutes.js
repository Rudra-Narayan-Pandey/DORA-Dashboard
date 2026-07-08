const express = require('express');
const projectController = require('../controllers/projectController');
const router = express.Router();

// GET /api/projects
router.get('/', projectController.getProjects);

module.exports = router;
