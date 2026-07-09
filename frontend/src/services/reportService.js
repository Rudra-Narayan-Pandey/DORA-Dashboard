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
  let dfValue, ltValue, cfrValue;
  
  if (totalDeployments === 0) {
    // No deployments in this window — show "No Data" instead of misleading zeros
    dfValue = 'No Data';
    ltValue = 'No Data';
    cfrValue = 'No Data';
  } else {
    dfValue = `${metrics.deploymentFrequency.value} / day`;
    ltValue = `${metrics.leadTime.value} hours`;
    const ltHours = parseFloat(metrics.leadTime.value || 0);
    if (ltHours > 0 && ltHours < 1) {
      const totalSeconds = Math.round(ltHours * 3600);
      if (totalSeconds < 60) ltValue = `${totalSeconds} seconds`;
      else ltValue = `${Math.round(ltHours * 60)} minutes`;
    } else if (ltHours === 0 && successfulDeployments === 0) {
      ltValue = 'No successful runs';
    }
    cfrValue = `${metrics.changeFailureRate.value}%`;
  }
  let mttrValue = `${metrics.meanTimeToRestore.value} mins`;
  
  const ratingToGrade = (rating) => rating === 'Elite' ? 'A' : rating === 'High' ? 'B' : rating === 'Medium' ? 'C' : 'D';

  const grades = {
    deploymentFrequency: ratingToGrade(metrics.deploymentFrequency.rating),
    leadTime: ratingToGrade(metrics.leadTime.rating),
    changeFailureRate: ratingToGrade(metrics.changeFailureRate.rating),
    meanTimeToRestore: ratingToGrade(metrics.meanTimeToRestore.rating),
  };

  // When there are ZERO deployments, CFR/DF/LT are meaningless — mark N/A
  if (totalDeployments === 0) {
    grades.deploymentFrequency = 'N/A';
    grades.leadTime = 'N/A';
    grades.changeFailureRate = 'N/A';
  }
  if (totalIncidents === 0) {
    mttrValue = 'No Outages';
    grades.meanTimeToRestore = 'N/A';
  }

  // GPA-based overall grade — only count metrics that have real data
  const gpaMapping = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
  let totalPoints = 0;
  let gradedMetricsCount = 0;
  
  Object.entries(grades).forEach(([key, val]) => {
    if (key !== 'overall' && gpaMapping[val] !== undefined) {
      totalPoints += gpaMapping[val];
      gradedMetricsCount++;
    }
  });
  
  let overallGrade = 'N/A';
  if (gradedMetricsCount > 0) {
    const avgGpa = totalPoints / gradedMetricsCount;
    if (avgGpa >= 3.5) overallGrade = 'A';
    else if (avgGpa >= 3.0) overallGrade = 'A-';
    else if (avgGpa >= 2.5) overallGrade = 'B';
    else if (avgGpa >= 2.0) overallGrade = 'C+';
    else if (avgGpa >= 1.5) overallGrade = 'C';
    else overallGrade = 'D';
  }
  
  grades.overall = overallGrade;

  // Generate recommendations based on REAL data with environment context
  const recommendations = [];
  const rangeLabel = range === '7d' ? '7-day' : range === '30d' ? '30-day' : '90-day';
  const envLabel = environment === 'All' ? 'all environments' : environment;
  
  // 1. Change Failure Rate
  const cfrVal = parseFloat(metrics.changeFailureRate.value || 0);
  if (totalDeployments === 0) {
    recommendations.push(`No pipeline runs found in ${envLabel} within the ${rangeLabel} window. Trigger a deployment or expand the date range to begin tracking Change Failure Rate.`);
  } else if (cfrVal === 0) {
    recommendations.push(`All ${totalDeployments} pipeline ${totalDeployments === 1 ? 'run' : 'runs'} in ${envLabel} completed successfully (CFR: 0%). Current branch protection and review policies are effective — maintain them.`);
  } else if (cfrVal <= 15) {
    recommendations.push(`${failedDeployments} of ${totalDeployments} pipeline ${totalDeployments === 1 ? 'run' : 'runs'} failed in ${envLabel} (CFR: ${cfrValue}). Add pre-merge validation gates and increase unit test coverage to reduce failures.`);
  } else {
    recommendations.push(`${failedDeployments} of ${totalDeployments} pipeline ${totalDeployments === 1 ? 'run' : 'runs'} failed in ${envLabel} (CFR: ${cfrValue}). Investigate the failing build definitions, check for flaky tests, and consider adding a Canary stage before Production.`);
  }

  // 2. Lead Time for Changes
  const ltVal = parseFloat(metrics.leadTime.value || 0);
  if (successfulDeployments === 0) {
    recommendations.push(`No successful deployments in ${envLabel} within the ${rangeLabel} window — Lead Time cannot be calculated. Prioritize fixing the ${failedDeployments > 0 ? failedDeployments + ' failing ' + (failedDeployments === 1 ? 'pipeline' : 'pipelines') : 'pipeline configuration'} first.`);
  } else if (ltVal <= 1) {
    recommendations.push(`Lead Time is Elite: ${successfulDeployments} successful ${successfulDeployments === 1 ? 'deploy' : 'deploys'} in ${envLabel} averaged ${ltValue}. CI/CD pipeline speed is optimal — maintain current build caching and parallel test strategies.`);
  } else if (ltVal <= 8) {
    recommendations.push(`Lead Time in ${envLabel} averages ${ltValue} across ${successfulDeployments} successful ${successfulDeployments === 1 ? 'deploy' : 'deploys'}. Reduce PR scope sizes and enable parallel test execution to push toward Elite tier.`);
  } else {
    recommendations.push(`Lead Time in ${envLabel} averages ${ltValue} across ${successfulDeployments} successful ${successfulDeployments === 1 ? 'deploy' : 'deploys'}. Audit build queue wait times, approval bottlenecks, and test suite duration to find the slowdown.`);
  }

  // 3. MTTR
  if (totalIncidents === 0) {
    recommendations.push(`Zero incidents or outages reported in ${envLabel} during the ${rangeLabel} window. Continue monitoring with automated health checks and alert thresholds.`);
  } else {
    const mttrVal = parseFloat(metrics.meanTimeToRestore.value || 0);
    const unresolvedCount = totalIncidents - resolvedIncidents;
    if (mttrVal <= 30) {
      recommendations.push(`MTTR across ${totalIncidents} ${totalIncidents === 1 ? 'incident' : 'incidents'} in ${envLabel} is ${mttrValue} (${resolvedIncidents} resolved${unresolvedCount > 0 ? ', ' + unresolvedCount + ' open' : ''}). Incident response is strong — document runbooks to sustain this.`);
    } else {
      recommendations.push(`MTTR across ${totalIncidents} ${totalIncidents === 1 ? 'incident' : 'incidents'} in ${envLabel} is ${mttrValue} (${resolvedIncidents} resolved${unresolvedCount > 0 ? ', ' + unresolvedCount + ' still open' : ''}). Set up automated rollback triggers and on-call escalation policies to reduce restore times.`);
    }
  }

  // 4. Deployment Frequency
  const dfVal = parseFloat(metrics.deploymentFrequency.value || 0);
  if (totalDeployments === 0) {
    recommendations.push(`No deployments detected in ${envLabel} for the ${rangeLabel} window. Configure CI triggers on your main branch to automate deployments.`);
  } else if (dfVal >= 5) {
    recommendations.push(`Deployment frequency in ${envLabel} is Elite at ${successfulDeployments} successful ${successfulDeployments === 1 ? 'deploy' : 'deploys'} over the ${rangeLabel} window. Continue leveraging automated release gates.`);
  } else if (dfVal >= 1) {
    recommendations.push(`${successfulDeployments} successful ${successfulDeployments === 1 ? 'deploy' : 'deploys'} detected in ${envLabel} over the ${rangeLabel} window. Streamline staging validation and reduce manual approval gates to ship more frequently.`);
  } else {
    recommendations.push(`Only ${successfulDeployments} successful ${successfulDeployments === 1 ? 'deploy' : 'deploys'} out of ${totalDeployments} total ${totalDeployments === 1 ? 'run' : 'runs'} in ${envLabel} over the ${rangeLabel} window. Focus on build stability first — once failures drop, deploy frequency will naturally increase.`);
  }

  const reportPayload = {
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
  
  return reportPayload;
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
