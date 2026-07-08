const logger = require('../utils/logger');

const formatDisplayName = (value) => {
  if (!value) return 'Gargi and Rudra';
  const rawValue = String(value);
  if (/rudra[-\s_]*narayan[-\s_]*pandey/i.test(rawValue) || /rudra[-\s_]*narayan/i.test(rawValue)) {
    return 'Gargi and Rudra';
  }
  return rawValue.trim() || 'Gargi and Rudra';
};

const authController = {
  /**
   * Validates Azure DevOps connection status and retrieves the profile of the current PAT owner.
   * 
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  getProfile: async (req, res, next) => {
    const client = req.getCoreClient();
    const startTime = Date.now();
    
    try {
      // connectiondata endpoint returns authentication identity details
      const response = await client.get('/_apis/connectiondata');
      const connectionData = response.data;
      const user = connectionData.authenticatedUser;
      
      const profile = {
        displayName: formatDisplayName(user.providerDisplayName || user.customDisplayName),
        email: user.directoryAlias ? `${user.directoryAlias}@dev.azure.com` : '',
        avatarUrl: null
      };

      const duration = Date.now() - startTime;
      logger.info('User profile connection verified successfully.', duration);

      res.status(200).json({
        success: true,
        message: 'Personal Access Token validated successfully.',
        data: profile,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
