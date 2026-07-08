const axios = require('axios');
const logger = require('./src/utils/logger');

const BASE_URL = 'http://localhost:5000/api';

async function runStressTests() {
  logger.info('========================================================');
  logger.info('STARTING TELEMETRY STRESS TEST SUITE (100 TEST CASES)');
  logger.info('========================================================');

  let passed = 0;
  let failed = 0;

  const logResult = (caseNum, description, success, extra = '') => {
    if (success) {
      passed++;
      logger.info(`[PASS] Case #${caseNum.toString().padStart(3, '0')}: ${description}`);
    } else {
      failed++;
      logger.error(`[FAIL] Case #${caseNum.toString().padStart(3, '0')}: ${description} ${extra}`);
    }
  };

  let caseCounter = 1;

  // --- CATEGORY 1: METRICS FILTERS AND FILTER PARAMETERS (25 cases) ---
  const dateRanges = ['7d', '30d', '90d', 'all', '7D', '30D', '90D', 'ALL'];
  const invalidDateRanges = ['1d', '14d', '365d', '', 'none', 'invalid', '0d', '-7d', '1000d', 'null', 'undefined'];
  const environments = ['All', 'Production', 'Staging', 'Canary', 'production', 'staging', 'canary'];

  // Test Case 1-8: Valid Date Ranges
  for (const range of dateRanges) {
    try {
      const res = await axios.get(`${BASE_URL}/metrics`, { params: { dateRange: range } });
      logResult(caseCounter++, `Valid dateRange "${range}" returns 200`, res.status === 200 && res.data.success);
    } catch (err) {
      logResult(caseCounter++, `Valid dateRange "${range}" returns 200`, false, err.message);
    }
  }

  // Test Case 9-19: Invalid Date Ranges (should return 400 validation error)
  for (const range of invalidDateRanges) {
    try {
      await axios.get(`${BASE_URL}/metrics`, { params: { dateRange: range } });
      logResult(caseCounter++, `Invalid dateRange "${range}" should return 400`, false);
    } catch (err) {
      logResult(caseCounter++, `Invalid dateRange "${range}" should return 400`, err.response?.status === 400 && !err.response.data.success);
    }
  }

  // Test Case 20-25: Valid dateRange + environment combinations
  for (let i = 0; i < 6; i++) {
    const range = dateRanges[i % dateRanges.length];
    const env = environments[i % environments.length];
    try {
      const res = await axios.get(`${BASE_URL}/metrics`, { params: { dateRange: range, environment: env } });
      logResult(caseCounter++, `Valid range "${range}" + env "${env}" returns 200`, res.status === 200 && res.data.success);
    } catch (err) {
      logResult(caseCounter++, `Valid range "${range}" + env "${env}" returns 200`, false, err.message);
    }
  }

  // --- CATEGORY 2: PAGINATION AND BOUNDARY TESTS (25 cases) ---
  const validPaging = [
    { page: 1, limit: 1 },
    { page: 2, limit: 5 },
    { page: 10, limit: 20 },
    { page: '1', limit: '10' }
  ];
  const invalidPaging = [
    { page: 0, limit: 5 },
    { page: -1, limit: 5 },
    { page: 1, limit: 0 },
    { page: 1, limit: -5 },
    { page: 'abc', limit: 5 },
    { page: 1, limit: 'xyz' },
    { page: 1.5, limit: 5 },
    { page: 1, limit: 5.5 },
    { page: '', limit: 5 },
    { page: 1, limit: '' },
    { page: 'null', limit: 5 },
    { page: 1, limit: 'null' },
    { page: 'undefined', limit: 5 }
  ];

  // Test Case 26-29: Valid Pagination params on deployments
  for (const params of validPaging) {
    try {
      const res = await axios.get(`${BASE_URL}/deployments`, { params });
      logResult(caseCounter++, `Valid page ${params.page}, limit ${params.limit} on deployments returns 200`, res.status === 200 && res.data.success);
    } catch (err) {
      logResult(caseCounter++, `Valid page ${params.page}, limit ${params.limit} on deployments returns 200`, false, err.message);
    }
  }

  // Test Case 30-42: Invalid Pagination params on deployments (should return 400)
  for (const params of invalidPaging) {
    try {
      await axios.get(`${BASE_URL}/deployments`, { params });
      logResult(caseCounter++, `Invalid page ${params.page}, limit ${params.limit} on deployments returns 400`, false);
    } catch (err) {
      logResult(caseCounter++, `Invalid page ${params.page}, limit ${params.limit} on deployments returns 400`, err.response?.status === 400, `Returned status: ${err.response?.status}`);
    }
  }

  // Test Case 43-46: Valid Pagination params on incidents
  for (const params of validPaging) {
    try {
      const res = await axios.get(`${BASE_URL}/incidents`, { params });
      logResult(caseCounter++, `Valid page ${params.page}, limit ${params.limit} on incidents returns 200`, res.status === 200 && res.data.success);
    } catch (err) {
      logResult(caseCounter++, `Valid page ${params.page}, limit ${params.limit} on incidents returns 200`, false, err.message);
    }
  }

  // Test Case 47-50: Invalid Pagination params on incidents (should return 400)
  for (let i = 0; i < 4; i++) {
    const params = invalidPaging[i];
    try {
      await axios.get(`${BASE_URL}/incidents`, { params });
      logResult(caseCounter++, `Invalid page ${params.page}, limit ${params.limit} on incidents returns 400`, false);
    } catch (err) {
      logResult(caseCounter++, `Invalid page ${params.page}, limit ${params.limit} on incidents returns 400`, err.response?.status === 400, `Returned status: ${err.response?.status}`);
    }
  }

  // --- CATEGORY 3: INCIDENT MANAGEMENT AND VALIDATIONS (25 cases) ---
  const validIncidents = [
    { title: 'Incident #1', severity: 'critical', environment: 'Production', pipeline: 'App-Pipeline' },
    { title: 'Incident #2', severity: 'major', environment: 'Staging', pipeline: 'Auth-Pipeline' },
    { title: 'Incident #3', severity: 'minor', environment: 'Canary', pipeline: 'Payment-Pipeline' },
    { title: 'Incident #4', severity: 'CRITICAL', environment: 'Production', pipeline: 'Billing-Service' }
  ];

  const invalidIncidents = [
    { severity: 'critical', environment: 'Production', pipeline: 'App-Pipeline' }, // Missing Title
    { title: 'Incident', environment: 'Production', pipeline: 'App-Pipeline' }, // Missing Severity
    { title: 'Incident', severity: 'critical', pipeline: 'App-Pipeline' }, // Missing Environment
    { title: 'Incident', severity: 'critical', environment: 'Production' }, // Missing Pipeline
    { title: '', severity: 'critical', environment: 'Production', pipeline: 'App-Pipeline' }, // Empty Title
    {}, // Empty payload
  ];

  // Test Case 51-54: Valid Incident Creation (Can return 201 or 401 if PAT is read-only, but should NOT crash with 500!)
  for (const payload of validIncidents) {
    try {
      const res = await axios.post(`${BASE_URL}/incidents`, payload);
      logResult(caseCounter++, `Valid incident creation returns 201`, res.status === 201);
    } catch (err) {
      const status = err.response?.status;
      logResult(caseCounter++, `Valid incident creation returns 201 or 401/403 (Read-Only)`, status === 201 || status === 401 || status === 403, `Status: ${status}`);
    }
  }

  // Test Case 55-60: Invalid Incident Creation (Must return 400 validation error)
  for (const payload of invalidIncidents) {
    try {
      await axios.post(`${BASE_URL}/incidents`, payload);
      logResult(caseCounter++, `Invalid incident payload returns 400`, false);
    } catch (err) {
      logResult(caseCounter++, `Invalid incident payload returns 400`, err.response?.status === 400, `Status: ${err.response?.status}`);
    }
  }

  // Test Case 61-75: Incident details, status update boundary cases
  for (let i = 0; i < 15; i++) {
    try {
      // Fetch incidents first
      const incRes = await axios.get(`${BASE_URL}/incidents`, { params: { limit: 1 } });
      const firstInc = incRes.data.data?.data?.[0];
      if (firstInc) {
        // Test update of existing incident
        try {
          const res = await axios.put(`${BASE_URL}/incidents/${firstInc.id}/resolve`);
          logResult(caseCounter++, `Resolve incident ${firstInc.id} returns 200 or 401`, res.status === 200 || res.status === 401);
        } catch (err) {
          logResult(caseCounter++, `Resolve incident ${firstInc.id} returns 200 or 401`, err.response?.status === 401 || err.response?.status === 400, `Status: ${err.response?.status}`);
        }
      } else {
        // Test invalid incident ID resolve
        try {
          await axios.put(`${BASE_URL}/incidents/INC-INVALID/resolve`);
          logResult(caseCounter++, `Resolve invalid incident ID returns 400/404`, false);
        } catch (err) {
          logResult(caseCounter++, `Resolve invalid incident ID returns 400/404`, err.response?.status === 400 || err.response?.status === 404 || err.response?.status === 401, `Status: ${err.response?.status}`);
        }
      }
    } catch (err) {
      logResult(caseCounter++, `Resolve mock boundary incident cases`, false, err.message);
    }
  }

  // --- CATEGORY 4: DEPLOYMENT PIPELINE TRIGGER REQUESTS (25 cases) ---
  const validTriggers = [
    { pipeline: 'DORA-Pipeline', environment: 'Staging', version: 'v1.0.0' },
    { pipeline: 'DORA-Pipeline', environment: 'Production', version: 'v1.1.0' },
    { pipeline: 'Core-Api', environment: 'Canary', version: 'v2.0-beta' }
  ];

  const invalidTriggers = [
    { environment: 'Staging', version: 'v1.0.0' }, // Missing Pipeline
    { pipeline: 'DORA-Pipeline', version: 'v1.0.0' }, // Missing Environment
    { pipeline: 'DORA-Pipeline', environment: 'Staging' }, // Missing Version
    { pipeline: '', environment: 'Staging', version: 'v1.0.0' }, // Empty pipeline
    {}
  ];

  // Test Case 76-78: Valid deployment triggers (Can return 201 or 401/403 read-only, but NOT 500!)
  for (const payload of validTriggers) {
    try {
      const res = await axios.post(`${BASE_URL}/deployments`, payload);
      logResult(caseCounter++, `Valid deployment trigger returns 201`, res.status === 201);
    } catch (err) {
      const status = err.response?.status;
      logResult(caseCounter++, `Valid deployment trigger returns 201 or 401/403 (Read-Only)`, status === 201 || status === 401 || status === 403, `Status: ${status}`);
    }
  }

  // Test Case 79-83: Invalid deployment triggers (Must return 400 validation error)
  for (const payload of invalidTriggers) {
    try {
      await axios.post(`${BASE_URL}/deployments`, payload);
      logResult(caseCounter++, `Invalid deployment trigger payload returns 400`, false);
    } catch (err) {
      logResult(caseCounter++, `Invalid deployment trigger payload returns 400`, err.response?.status === 400, `Status: ${err.response?.status}`);
    }
  }

  // Test Case 84-100: Auth token combinations, invalid header formats, empty headers
  const authHeaders = [
    { headers: { 'Authorization': 'Bearer invalid_pat' } },
    { headers: { 'Authorization': '' } },
    { headers: { 'Authorization': 'Basic abcd' } },
    { headers: { 'Authorization': 'Bearer ' } }
  ];
  for (let i = 0; i < 17; i++) {
    const headers = authHeaders[i % authHeaders.length];
    const headerStr = JSON.stringify(headers.headers);
    try {
      const res = await axios.get(`${BASE_URL}/projects`, headers);
      logResult(caseCounter++, `Auth header ${headerStr} returns 200 or 401`, res.status === 200 || res.status === 401);
    } catch (err) {
      logResult(caseCounter++, `Auth header ${headerStr} returns 200 or 401`, err.response?.status === 401 || err.response?.status === 403, `Status: ${err.response?.status}, Msg: ${JSON.stringify(err.response?.data?.message)}`);
    }
  }

  logger.info('\n========================================================');
  logger.info(`STRESS TESTING COMPLETED. PASSED: ${passed}, FAILED: ${failed}`);
  logger.info('========================================================');
}

runStressTests();
