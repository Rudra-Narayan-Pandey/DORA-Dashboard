export const ENVIRONMENTS = {
  PRODUCTION: 'Production',
  CANARY: 'Canary',
  STAGING: 'Staging',
};

export const PIPELINES = [
  'Frontend Dashboard',
  'Authentication Service',
  'Core API Gateway',
  'Billing Service',
  'Analytics Pipeline',
  'Database Migration'
];

export const DORA_LEVELS = {
  ELITE: 'Elite',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const DATE_RANGES = {
  LAST_24H: '24h',
  LAST_7D: '7d',
  LAST_30D: '30d',
  LAST_90D: '90d',
  ALL: 'all'
};

export const STATUS_TYPES = {
  SUCCESS: 'success',
  FAILED: 'failed',
  ROLLING_BACK: 'rolling_back',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  INVESTIGATING: 'investigating',
};
