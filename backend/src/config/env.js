const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the .env file in the backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const requiredEnv = [
  'AZURE_PAT',
  'AZURE_ORGANIZATION',
  'AZURE_PROJECT'
];

const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', 'CONFIG ERROR: The following required environment variables are missing:');
  missingEnv.forEach(key => console.error('\x1b[31m%s\x1b[0m', `  - ${key}`));
  console.error('\x1b[33m%s\x1b[0m', 'Please check your backend .env file configuration.\n');
  process.exit(1);
}

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  AZURE_PAT: process.env.AZURE_PAT,
  AZURE_ORGANIZATION: process.env.AZURE_ORGANIZATION,
  AZURE_PROJECT: process.env.AZURE_PROJECT,
  AZURE_API_VERSION: process.env.AZURE_API_VERSION || '7.1',
  AZURE_INCIDENT_WORK_ITEM_TYPE: process.env.AZURE_INCIDENT_WORK_ITEM_TYPE || 'Bug',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};
