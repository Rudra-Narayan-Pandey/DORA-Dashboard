const { coreClient, releaseClient, createAzureClient } = require('../config/azure');
const env = require('../config/env');

/**
 * Authentication middleware.
 * Inspects incoming requests for an Authorization: Bearer <token> header.
 * 
 * If present, it maps the token as a dynamic Personal Access Token (PAT) for the request context,
 * providing the controller and services with custom-built Azure Axios instances.
 * If absent, it defaults to the system-configured static Azure Axios instances.
 */
const auth = (req, res, next) => {
  let token = env.AZURE_PAT;
  let isCustom = false;

  const authHeader = req.headers.authorization;
  if (authHeader !== undefined) {
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format: must use Bearer schema',
        error: { code: 'UNAUTHORIZED' }
      });
    }

    const extractedToken = authHeader.substring(7).trim();
    if (!extractedToken || extractedToken === 'null' || extractedToken === 'undefined') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token: token cannot be empty',
        error: { code: 'UNAUTHORIZED' }
      });
    }

    token = extractedToken;
    isCustom = true;
  }

  // Bind the resolved PAT and Axios factory functions to the request object
  req.azurePat = token;
  if (isCustom) {
    req.getCoreClient = () => createAzureClient(`https://dev.azure.com/${env.AZURE_ORGANIZATION}`);
    req.getReleaseClient = () => createAzureClient(`https://vsrm.dev.azure.com/${env.AZURE_ORGANIZATION}`);
  } else {
    req.getCoreClient = () => coreClient;
    req.getReleaseClient = () => releaseClient;
  }

  next();
};

module.exports = auth;
