const workItemService = require('../services/workItemService');

const workItemController = {
  /**
   * Retrieves mapped work items in the project.
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  getWorkItems: async (req, res, next) => {
    try {
      const data = await workItemService.getWorkItems(req);
      
      res.status(200).json({
        success: true,
        message: 'Work items backlog retrieved successfully.',
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = workItemController;
