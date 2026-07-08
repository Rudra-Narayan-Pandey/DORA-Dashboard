const express = require('express');
const incidentController = require('../controllers/incidentController');
const { validatePagination, validateIncidentCreation } = require('../middleware/validation');
const router = express.Router();

// GET /api/incidents
router.get('/', validatePagination, incidentController.getIncidents);

// POST /api/incidents
router.post('/', validateIncidentCreation, incidentController.createIncident);

// PUT /api/incidents/:id/resolve
router.put('/:id/resolve', incidentController.resolveIncident);

module.exports = router;
