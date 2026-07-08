/**
 * Validation rules middleware to verify query parameters, URL path variables,
 * and request bodies before entering business logic execution.
 */

const validateMetricsFilters = (req, res, next) => {
  const { dateRange, environment } = req.query;
  const validRanges = ['7d', '30d', '90d', 'all'];

  if (dateRange !== undefined && !validRanges.includes(dateRange.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid query parameter: dateRange must be one of [${validRanges.join(', ')}]`,
      error: {
        code: 'VALIDATION_ERROR',
        details: { parameter: 'dateRange', value: dateRange }
      }
    });
  }

  next();
};

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined && (page === '' || isNaN(page) || Number(page) % 1 !== 0 || parseInt(page, 10) <= 0)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pagination parameter: page must be a positive integer',
      error: {
        code: 'VALIDATION_ERROR',
        details: { parameter: 'page', value: page }
      }
    });
  }

  if (limit !== undefined && (limit === '' || isNaN(limit) || Number(limit) % 1 !== 0 || parseInt(limit, 10) <= 0)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid pagination parameter: limit must be a positive integer',
      error: {
        code: 'VALIDATION_ERROR',
        details: { parameter: 'limit', value: limit }
      }
    });
  }

  next();
};

const validateIncidentCreation = (req, res, next) => {
  const { title, severity, environment, pipeline } = req.body;
  const missingFields = [];

  if (!title) missingFields.push('title');
  if (!severity) missingFields.push('severity');
  if (!environment) missingFields.push('environment');
  if (!pipeline) missingFields.push('pipeline');

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Validation failed: missing required fields: [${missingFields.join(', ')}]`,
      error: {
        code: 'VALIDATION_ERROR',
        details: { missing: missingFields }
      }
    });
  }

  next();
};

const validateDeploymentTrigger = (req, res, next) => {
  const { version, environment, pipeline, pipelineId } = req.body;
  const missingFields = [];

  if (!version) missingFields.push('version');
  if (!environment) missingFields.push('environment');
  if (!pipeline && !pipelineId) missingFields.push('pipeline or pipelineId');

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Validation failed: missing required fields: [${missingFields.join(', ')}]`,
      error: {
        code: 'VALIDATION_ERROR',
        details: { missing: missingFields }
      }
    });
  }

  if (pipelineId !== undefined && pipelineId !== '' && (!Number.isInteger(Number(pipelineId)) || Number(pipelineId) <= 0)) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: pipelineId must be a positive Azure pipeline identifier',
      error: {
        code: 'VALIDATION_ERROR',
        details: { parameter: 'pipelineId', value: pipelineId }
      }
    });
  }

  next();
};

module.exports = {
  validateMetricsFilters,
  validatePagination,
  validateIncidentCreation,
  validateDeploymentTrigger
};
