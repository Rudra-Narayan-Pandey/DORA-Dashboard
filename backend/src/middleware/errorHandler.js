const logger = require('../utils/logger');
const env = require('../config/env');

/**
 * Express centralized error handler middleware.
 * Maps application and Axios API errors to standard JSON response envelopes,
 * ensuring sensitive credentials (PATs) are never exposed.
 */
const errorHandler = (err, req, res, next) => {
  const duration = res.reqStart ? Date.now() - res.reqStart : null;
  
  // Log the raw error internally for server troubleshooting
  logger.error(`${req.method} ${req.originalUrl} failed`, err, duration);

  let statusCode = 500;
  let message = 'An unexpected server error occurred. Please contact the control deck.';
  let errCode = 'INTERNAL_SERVER_ERROR';
  let details = null;

  // Handle Axios response errors
  if (err.isAxiosError) {
    const response = err.response;
    statusCode = response ? response.status : 502; // Bad Gateway if Azure DevOps is unresponsive
    errCode = 'AZURE_DEVOPS_API_ERROR';
    
    if (statusCode === 401) {
      statusCode = 401;
      message = 'Azure DevOps connection unauthorized. Please check that the AZURE_PAT is valid and has not expired.';
      errCode = 'AZURE_PAT_UNAUTHORIZED';
    } else if (statusCode === 403) {
      statusCode = 403;
      message = 'Azure DevOps request forbidden. Ensure the Personal Access Token has correct scopes.';
      errCode = 'AZURE_PAT_FORBIDDEN';
    } else if (statusCode === 404) {
      statusCode = 404;
      message = 'Requested Azure DevOps resource could not be found. Check organization/project configuration.';
      errCode = 'AZURE_RESOURCE_NOT_FOUND';
    } else {
      message = `Azure DevOps API returned code ${statusCode} with message: ${err.message}`;
    }

    // Safely extract Azure response details, stripping out private URLs/PAT details
    details = response && response.data ? response.data : { message: err.message };
  } else {
    // Handle standard JavaScript exceptions
    statusCode = err.status || 500;
    message = err.message || message;
    if (env.NODE_ENV === 'development') {
      details = { stack: err.stack };
    }
  }

  // Ensure response headers aren't already sent
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: {
      code: errCode,
      details: details
    },
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
