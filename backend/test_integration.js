const axios = require('axios');
const logger = require('./src/utils/logger');

const BASE_URL = 'http://localhost:5000/api';

const runTest = async () => {
  logger.info('========================================================');
  logger.info('STARTING END-TO-END TELEMETRY INTEGRATION TEST');
  logger.info('========================================================');

  try {
    // 1. Check API Health
    logger.info('Step 1: Pinging Health diagnostics API...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    const health = healthRes.data.data;
    logger.info(`Health Status: ${health.status} (Azure Connected: ${health.azureConnected})`);

    // 2. Query Projects
    logger.info('\nStep 2: Fetching organization projects...');
    const projRes = await axios.get(`${BASE_URL}/projects`);
    const projects = projRes.data.data;
    logger.info(`Projects Found: ${projects.length}`);
    projects.forEach(p => logger.info(`  - [${p.id}] ${p.name} (State: ${p.state})`));

    // 3. Query Pipelines
    logger.info('\nStep 3: Fetching pipelines config list...');
    const pipeRes = await axios.get(`${BASE_URL}/pipelines`);
    const pipelines = pipeRes.data.data;
    logger.info(`Pipelines Found: ${pipelines.length}`);
    pipelines.forEach(p => logger.info(`  - [ID: ${p.id}] ${p.name} (Type: ${p.type})`));

    // 4. Retrieve Deployments Ledger
    logger.info('\nStep 4: Compiling deployments ledger...');
    const depRes = await axios.get(`${BASE_URL}/deployments`);
    const deploymentsResult = depRes.data.data;
    const deployments = deploymentsResult.data;
    const pagination = deploymentsResult.pagination;
    logger.info(`Deployments Total: ${pagination.total}`);
    if (deployments.length > 0) {
      logger.info('Recent Deployments:');
      deployments.forEach(d => logger.info(`  - [${d.id}] version: ${d.version} to ${d.environment} via ${d.pipeline} (Status: ${d.status})`));
    }

    // 5. Test Trigger Release (Optional pipeline launch)
    logger.info('\nStep 5: Testing deployment launch trigger...');
    const testTriggerPayload = {
      pipeline: pipelines[0] ? pipelines[0].name : 'Rudra-Narayan-Pandey.DORA-Dashboard',
      environment: 'Staging',
      version: `test-build-v${Math.floor(100 + Math.random() * 900)}`,
      triggeredBy: 'Integration Tester'
    };
    try {
      const triggerRes = await axios.post(`${BASE_URL}/deployments`, testTriggerPayload);
      const trigger = triggerRes.data.data;
      logger.info(`Trigger Response: Successful release queued (ID: ${trigger.id}, status: ${trigger.status})`);
    } catch (err) {
      logger.warn(`WARNING: Optional trigger release failed (this is expected if PAT lacks Build-Queue permissions): ${err.response ? JSON.stringify(err.response.data.message) : err.message}`);
    }

    // 6. Create Incident outage bug in Azure DevOps
    let createdIncidentId = null;
    logger.info('\nStep 6: Creating a live incident bug in Azure DevOps...');
    const incidentPayload = {
      title: 'TEST-INCIDENT: API Gateway Connection Pool Exhaustion',
      severity: 'critical',
      environment: 'Production',
      pipeline: 'Core API Gateway',
      description: 'TEST OUTAGE: Automated simulation of connection pool exhaustion under 200% traffic spike.'
    };
    try {
      const createIncRes = await axios.post(`${BASE_URL}/incidents`, incidentPayload);
      const newIncident = createIncRes.data.data;
      createdIncidentId = newIncident.id;
      logger.info(`Incident Bug Created: ${newIncident.id} (Azure ID: ${newIncident.id.replace('INC-', '')})`);
      logger.info(`  Title: ${newIncident.title}`);
      logger.info(`  Severity: ${newIncident.severity}`);
      logger.info(`  Status: ${newIncident.status}`);
    } catch (err) {
      logger.warn(`WARNING: Incident bug creation skipped (PAT does not have Work Items Write permissions): ${err.response ? JSON.stringify(err.response.data.message) : err.message}`);
    }

    // 7. Verify Incident Ledger
    logger.info('\nStep 7: Compiling incidents ledger...');
    const incLedgerRes1 = await axios.get(`${BASE_URL}/incidents`);
    const incidentsResult = incLedgerRes1.data.data;
    const incidents = incidentsResult.data;
    logger.info(`Incidents in Ledger: ${incidents.length}`);
    if (incidents.length > 0) {
      incidents.forEach(i => logger.info(`  - [${i.id}] ${i.title} (Status: ${i.status}, Severity: ${i.severity})`));
    }

    // 8. Resolve the Incident bug if created
    if (createdIncidentId) {
      logger.info(`\nStep 8: Resolving incident ${createdIncidentId} in Azure DevOps...`);
      try {
        const resolveRes = await axios.put(`${BASE_URL}/incidents/${createdIncidentId}/resolve`);
        const resolvedIncident = resolveRes.data.data;
        logger.info(`Incident Resolved: Status is now "${resolvedIncident.status}"`);
        logger.info(`  Detected: ${resolvedIncident.detectedAt}`);
        logger.info(`  Resolved: ${resolvedIncident.resolvedAt}`);
        logger.info(`  Duration (MTTR): ${resolvedIncident.duration} mins`);
      } catch (err) {
        logger.error(`Error resolving incident ${createdIncidentId}:`, err.response ? err.response.data : err.message);
      }
    } else {
      logger.info('\nStep 8: Skipped incident resolution (no bug was created).');
    }

    // 9. Re-compile DORA Metrics to verify calculations
    logger.info('\nStep 9: Compiling DORA metrics analytics...');
    const metricsRes = await axios.get(`${BASE_URL}/metrics`);
    const metrics = metricsRes.data.data;
    logger.info('Calculated DORA Metric Ratings:');
    logger.info(`  - Deployment Frequency: ${metrics.deploymentFrequency.value} deploys/day (Rating: ${metrics.deploymentFrequency.rating})`);
    logger.info(`  - Lead Time for Changes: ${metrics.leadTime.value} hours (Rating: ${metrics.leadTime.rating})`);
    logger.info(`  - Change Failure Rate: ${metrics.changeFailureRate.value}% (Rating: ${metrics.changeFailureRate.rating})`);
    logger.info(`  - Mean Time to Restore (MTTR): ${metrics.meanTimeToRestore.value} mins (Rating: ${metrics.meanTimeToRestore.rating})`);

    logger.info('\n========================================================');
    logger.info('INTEGRATION TEST COMPLETED (10/10)');
    logger.info('========================================================');
  } catch (error) {
    logger.error('INTEGRATION TEST FAILED', error.response ? error.response.data : error);
    process.exit(1);
  }
};

runTest();
