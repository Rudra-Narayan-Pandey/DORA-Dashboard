const incidentService = require('../services/incidentService');

const incidentController = {
  /**
   * Retrieves paginated incidents/outages list.
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  getIncidents: async (req, res, next) => {
    try {
      const { page, limit, severity, status, environment, search } = req.query;
      const data = await incidentService.getIncidents(req, {
        page,
        limit,
        severity,
        status,
        environment,
        search
      });
      
      res.status(200).json({
        success: true,
        message: 'Incidents ledger compiled successfully.',
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
   * Registers a new incident (creates an outage bug in Azure DevOps).
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  createIncident: async (req, res, next) => {
    try {
      const { title, severity, environment, pipeline, description } = req.body;
      const data = await incidentService.createIncident(req, {
        title,
        severity,
        environment,
        pipeline,
        description
      });
      
      res.status(201).json({
        success: true,
        message: 'Incident registered successfully.',
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resolves an incident (marks the corresponding outage bug as Closed/Resolved in Azure DevOps).
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  resolveIncident: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await incidentService.resolveIncident(req, id);
      
      res.status(200).json({
        success: true,
        message: 'Incident resolved successfully.',
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = incidentController;
