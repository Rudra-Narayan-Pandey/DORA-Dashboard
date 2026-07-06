import { sleep } from '../utils/helpers';
import metricsMock from '../data/metrics.json';
import deploymentsMock from '../data/deployments.json';
import incidentsMock from '../data/incidents.json';

export const generateReport = async (filters = {}) => {
  await sleep(1200); // Reports take longer to compile!

  // Calculate grades based on metrics
  const df = parseFloat(metricsMock.deploymentFrequency.value);
  const lt = parseFloat(metricsMock.leadTime.value);
  const cfr = parseFloat(metricsMock.changeFailureRate.value);
  const mttr = parseFloat(metricsMock.meanTimeToRestore.value);

  let dfGrade = 'A';
  if (df < 2) dfGrade = 'D';
  else if (df < 5) dfGrade = 'C';
  else if (df < 10) dfGrade = 'B';

  let ltGrade = 'A';
  if (lt > 168) ltGrade = 'D'; // > 1 week
  else if (lt > 24) ltGrade = 'C'; // > 1 day
  else if (lt > 8) ltGrade = 'B';

  let cfrGrade = 'A';
  if (cfr > 15) cfrGrade = 'D';
  else if (cfr > 8) cfrGrade = 'C';
  else if (cfr > 4) cfrGrade = 'B';

  let mttrGrade = 'A';
  if (mttr > 1440) mttrGrade = 'D'; // > 24 hours
  else if (mttr > 240) mttrGrade = 'C'; // > 4 hours
  else if (mttr > 60) mttrGrade = 'B';

  const grades = {
    deploymentFrequency: dfGrade,
    leadTime: ltGrade,
    changeFailureRate: cfrGrade,
    meanTimeToRestore: mttrGrade,
    overall: [dfGrade, ltGrade, cfrGrade, mttrGrade].includes('D') ? 'C+' : 'A-'
  };

  return {
    compiledAt: new Date().toISOString(),
    range: filters.range || '7d',
    totalDeployments: deploymentsMock.length,
    successfulDeployments: deploymentsMock.filter(d => d.status === 'success').length,
    failedDeployments: deploymentsMock.filter(d => d.status === 'failed').length,
    totalIncidents: incidentsMock.length,
    resolvedIncidents: incidentsMock.filter(i => i.status === 'resolved').length,
    grades,
    systemIntegrityIndex: '98.4%',
    developerVelocityScore: '92/100',
    recommendations: [
      "Improve staging code coverage to lower the Staging build failure rate (currently 1 failed build).",
      "Billing Service canary cycle shows higher webhook validation error rates; verify pre-dep configurations.",
      "Authentication Service Redis cache replication lag needs active monitoring to resolve INC-4092."
    ]
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
