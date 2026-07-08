const express = require('express');
const workItemController = require('../controllers/workItemController');
const router = express.Router();

// GET /api/work-items
router.get('/', workItemController.getWorkItems);

module.exports = router;
