const app = require('./app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');

/**
 * Bootstraps the Express.js Web Server.
 * Registers handlers for process interruptions to shut down cleanly.
 */
const server = app.listen(env.PORT, () => {
  logger.info(`========================================================`);
  logger.info(`DORA Metrics Telemetry Server successfully initialized`);
  logger.info(`PORT: ${env.PORT}`);
  logger.info(`ENVIRONMENT: ${env.NODE_ENV}`);
  logger.info(`AZURE DEVOPS ORG: ${env.AZURE_ORGANIZATION}`);
  logger.info(`AZURE DEVOPS PROJECT: ${env.AZURE_PROJECT}`);
  logger.info(`GATEWAY STATUS: LISTENING`);
  logger.info(`========================================================`);
});

// Process signal interceptors for clean shutdowns
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal} interrupt. Initiating server teardown sequence...`);
  
  server.close(() => {
    logger.info('HTTP server closed. Process exiting.');
    process.exit(0);
  });

  // Force shutdown if connections cannot drain within 10 seconds
  setTimeout(() => {
    logger.error('Shutdown deadline exceeded. Forcing termination.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection detected', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception occurred', error);
  // Give logger time to flush logs before exit
  setTimeout(() => process.exit(1), 1000);
});
