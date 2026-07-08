const projectService = require('../services/projectService');

const projectController = {
  /**
   * Retrieves organization projects.
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  getProjects: async (req, res, next) => {
    try {
      const data = await projectService.getProjects(req);
      
      res.status(200).json({
        success: true,
        message: 'Organization projects fetched successfully.',
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = projectController;
