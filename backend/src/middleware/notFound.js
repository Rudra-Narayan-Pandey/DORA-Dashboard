/**
 * Middleware to catch all unmatched route requests and return a clean 404 error envelope.
 */
const notFound = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    error: {
      code: 'ROUTE_NOT_FOUND',
      details: `The requested path ${req.originalUrl} does not exist on this telemetry server.`
    }
  });
};

module.exports = notFound;
