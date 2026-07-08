const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Config and Middleware imports
const env = require('./src/config/env');
const auth = require('./src/middleware/auth');
const errorHandler = require('./src/middleware/errorHandler');
const notFound = require('./src/middleware/notFound');
const { validatePagination } = require('./src/middleware/validation');
const logger = require('./src/utils/logger');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const metricsRoutes = require('./src/routes/metricsRoutes');
const pipelineRoutes = require('./src/routes/pipelineRoutes');
const deploymentRoutes = require('./src/routes/deploymentRoutes');
const workItemRoutes = require('./src/routes/workItemRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const incidentRoutes = require('./src/routes/incidentRoutes');

// Controller import for top-level direct endpoints
const pipelineController = require('./src/controllers/pipelineController');

const app = express();

// 1. Request timeline instrumentation
app.use((req, res, next) => {
  res.reqStart = Date.now();
  next();
});

// 2. Global Security & Performance Middlewares
app.use(helmet());

const devOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.NODE_ENV === 'development' || devOrigins.includes(origin) || origin === env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy violation'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(compression());

// Rate Limiter: 100 requests per 15 minutes per IP (1000 in development to prevent test throttling)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'development' ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this console stream. Throttling active.',
    error: { code: 'RATE_LIMIT_EXCEEDED', details: 'Limit of 100 requests per 15 minutes has been reached.' }
  }
}));

// Morgan HTTP request logging integrated with custom logger
app.use(morgan((tokens, req, res) => {
  const duration = Date.now() - res.reqStart;
  const status = tokens.status(req, res);
  const logMsg = `${tokens.method(req, res)} ${tokens.url(req, res)} - Status: ${status} - Size: ${tokens.res(req, res, 'content-length') || 0} bytes`;
  
  if (status >= 400) {
    logger.warn(logMsg, duration);
  } else {
    logger.info(logMsg, duration);
  }
  return null;
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. API Router Mounts (Under /api, protected with auth resolver)
app.use('/api/auth', auth, authRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);
app.use('/api/metrics', auth, metricsRoutes);
app.use('/api/pipelines', auth, pipelineRoutes);
app.use('/api/deployments', auth, deploymentRoutes);
app.use('/api/work-items', auth, workItemRoutes);
app.use('/api/projects', auth, projectRoutes);
app.use('/api/incidents', auth, incidentRoutes);

// Top-level endpoint redirects to satisfy specific query contracts
app.get('/api/builds', auth, validatePagination, pipelineController.getBuilds);

// GET /api/health: diagnostics connectivity verification
app.get('/api/health', auth, async (req, res) => {
  const client = req.getCoreClient();
  const startTime = Date.now();
  let azureConnected = false;
  let diagnosticDetails = 'Azure DevOps connection failed';

  try {
    // Ping connectiondata endpoint to check PAT connectivity
    await client.get('/_apis/connectiondata');
    azureConnected = true;
    diagnosticDetails = 'Telemetry link active';
  } catch (err) {
    diagnosticDetails = `Azure DevOps REST API unreachable: ${err.message}`;
  }

  res.status(azureConnected ? 200 : 503).json({
    success: azureConnected,
    message: azureConnected ? 'Telemetry gateway operational' : 'Outage detected on gateway links',
    data: {
      status: azureConnected ? 'UP' : 'DOWN',
      azureConnected,
      latencyMs: Date.now() - startTime,
      diagnostics: diagnosticDetails,
      organization: env.AZURE_ORGANIZATION,
      project: env.AZURE_PROJECT
    },
    timestamp: new Date().toISOString()
  });
});

// 4. Fallbacks and Global Error Handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
