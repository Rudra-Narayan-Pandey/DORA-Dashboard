const axios = require('axios');
const env = require('./env');

/**
 * Creates a pre-configured Axios instance for Azure DevOps REST API calls.
 * Handles authentication header calculation and standard timeouts.
 * 
 * @param {string} baseURL The base URL domain for the API (Core vs. Release)
 * @returns {import('axios').AxiosInstance}
 */
const createAzureClient = (baseURL) => {
  // Azure DevOps PAT authentication requires an empty username and the PAT as password.
  // Format: "Basic Base64(':' + PAT)"
  const authHeader = 'Basic ' + Buffer.from(':' + env.AZURE_PAT).toString('base64');

  return axios.create({
    baseURL,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 15000 // 15s timeout to prevent hanging connections
  });
};

// Core Client: used for Projects, Repositories, Commits, Work Items, Pipelines, YAML Builds
const coreClient = createAzureClient(`https://dev.azure.com/${env.AZURE_ORGANIZATION}`);

// Release Client: used for Release pipelines, Classic Deployments, Environments
const releaseClient = createAzureClient(`https://vsrm.dev.azure.com/${env.AZURE_ORGANIZATION}`);

module.exports = {
  coreClient,
  releaseClient,
  createAzureClient
};
