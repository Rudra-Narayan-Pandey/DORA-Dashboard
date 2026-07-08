import api from './api';

export const generateReport = async (filters = {}) => {
  const range = filters.range || '7d';
  const environment = filters.environment || 'All';

  // 1. Fetch real metrics from the backend (response.data is the metrics object)
  const metricsRes = await api.get('/metrics', { params: { dateRange: range, environment } });
  const metrics = metricsRes.data;

  // 2. Fetch real deployments to calculate build success rate (response.data is { data, pagination })
  const deploymentsRes = await api.get('/deployments', { params: { dateRange: range, environment, limit: 100 } });
  const deploymentsList = deploymentsRes.data.data || [];
  const totalDeployments = deploymentsRes.data.pagination?.total || deploymentsList.length;
  
  const successfulDeployments = deploymentsList.filter(d => d.status === 'success').length;
  const failedDeployments = deploymentsList.filter(d => d.status === 'failed').length;

  // 3. Fetch real incidents to calculate total incidents count (response.data is { data, pagination })
  const incidentsRes = await api.get('/incidents', { params: { dateRange: range, environment, limit: 100 } });
  const incidentsList = incidentsRes.data.data || [];
  const totalIncidents = incidentsRes.data.pagination?.total || incidentsList.length;
  const resolvedIncidents = incidentsList.filter(i => i.status === 'resolved').length;

  // 4. Map the DORA values and grades
  const dfValue = `${metrics.deploymentFrequency.value} / day`;
  const ltValue = `${metrics.leadTime.value} hours`;
  const cfrValue = `${metrics.changeFailureRate.value}%`;
  const mttrValue = `${metrics.meanTimeToRestore.value} mins`;

  const grades = {
    deploymentFrequency: metrics.deploymentFrequency.rating === 'Elite' ? 'A' : metrics.deploymentFrequency.rating === 'High' ? 'B' : metrics.deploymentFrequency.rating === 'Medium' ? 'C' : 'D',
    leadTime: metrics.leadTime.rating === 'Elite' ? 'A' : metrics.leadTime.rating === 'High' ? 'B' : metrics.leadTime.rating === 'Medium' ? 'C' : 'D',
    changeFailureRate: metrics.changeFailureRate.rating === 'Elite' ? 'A' : metrics.changeFailureRate.rating === 'High' ? 'B' : metrics.changeFailureRate.rating === 'Medium' ? 'C' : 'D',
    meanTimeToRestore: metrics.meanTimeToRestore.rating === 'Elite' ? 'A' : metrics.meanTimeToRestore.rating === 'High' ? 'B' : metrics.meanTimeToRestore.rating === 'Medium' ? 'C' : 'D',
  };

  // Overall grade calculation
  const gradeValues = Object.values(grades);
  let overallGrade = 'A-';
  if (gradeValues.includes('D')) {
    overallGrade = 'C+';
  } else if (gradeValues.includes('C')) {
    overallGrade = 'B';
  } else if (gradeValues.filter(g => g === 'B').length >= 2) {
    overallGrade = 'B+';
  }

  grades.overall = overallGrade;

  // Generate dynamic recommendations based on real metrics
  const recommendations = [];
  if (parseFloat(metrics.changeFailureRate.value) > 15) {
    recommendations.push(`High Change Failure Rate detected (${metrics.changeFailureRate.value}%). Review staging build tests and canary gate verification protocols.`);
  } else {
    recommendations.push("Change failure rate is within the configured DORA threshold for the selected Azure DevOps window.");
  }

  if (parseFloat(metrics.leadTime.value) > 8) {
    recommendations.push(`Lead Time for Changes is high (${metrics.leadTime.value} hours). Analyze commit batches and optimize code review cycle queues.`);
  } else {
    recommendations.push("Lead time is within the configured DORA threshold for the selected Azure DevOps window.");
  }

  if (parseFloat(metrics.meanTimeToRestore.value) > 60) {
    recommendations.push(`MTTR exceeds service level agreement targets (${metrics.meanTimeToRestore.value} mins). Audit active incident alerts and automate rollback scripts.`);
  } else {
    recommendations.push("MTTR is within the configured DORA threshold for the selected Azure DevOps window.");
  }

  return {
    compiledAt: new Date().toISOString(),
    range: range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days',
    totalDeployments,
    successfulDeployments,
    failedDeployments,
    totalIncidents,
    resolvedIncidents,
    grades,
    metrics: {
      deploymentFrequency: dfValue,
      leadTime: ltValue,
      changeFailureRate: cfrValue,
      meanTimeToRestore: mttrValue
    },
    systemIntegrityIndex: parseFloat(metrics.changeFailureRate.value) > 0 ? `${(100 - parseFloat(metrics.changeFailureRate.value)).toFixed(1)}%` : '100%',
    recommendations
  };
};

export const exportReportData = (data, format = 'json') => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `DORA_Report_${new Date().toISOString().slice(0,10)}.${format}`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  return true;
};
