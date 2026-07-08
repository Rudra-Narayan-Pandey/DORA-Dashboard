/**
 * DORA Metrics Threshold Grading Utility
 * 
 * Reads user-configured thresholds from localStorage and grades
 * metric values as Elite / High / Medium / Low accordingly.
 */

const getThreshold = (key, fallback) => {
  const val = localStorage.getItem(key);
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
};

/**
 * Grade Deployment Frequency (higher is better)
 * Elite:  >= target
 * High:   >= 50% of target
 * Medium: >= 10% of target
 * Low:    < 10% of target
 */
export const gradeDeploymentFrequency = (value) => {
  const target = getThreshold('dora_df_limit', 24.5);
  if (value >= target) return { rating: 'Elite', label: 'ELITE PERFORMER', isGood: true };
  if (value >= target * 0.5) return { rating: 'High', label: 'HIGH PERFORMING', isGood: true };
  if (value >= target * 0.1) return { rating: 'Medium', label: 'NEEDS IMPROVEMENT', isGood: false };
  return { rating: 'Low', label: 'CRITICAL - BELOW TARGET', isGood: false };
};

/**
 * Grade Lead Time for Changes (lower is better)
 * Elite:  <= target
 * High:   <= 2x target
 * Medium: <= 5x target
 * Low:    > 5x target
 */
export const gradeLeadTime = (value) => {
  const target = getThreshold('dora_lt_limit', 1.2);
  if (value <= target) return { rating: 'Elite', label: 'ELITE - OPTIMIZED', isGood: true };
  if (value <= target * 2) return { rating: 'High', label: 'HIGH PERFORMING', isGood: true };
  if (value <= target * 5) return { rating: 'Medium', label: 'NEEDS IMPROVEMENT', isGood: false };
  return { rating: 'Low', label: 'CRITICAL - TOO SLOW', isGood: false };
};

/**
 * Grade Change Failure Rate (lower is better)
 * Elite:  <= target
 * High:   <= 3x target
 * Medium: <= 10x target
 * Low:    > 10x target
 */
export const gradeChangeFailureRate = (value) => {
  const target = getThreshold('dora_cfr_limit', 0.8);
  if (value <= target) return { rating: 'Elite', label: 'STABLE - WITHIN THRESHOLD', isGood: true };
  if (value <= target * 3) return { rating: 'High', label: 'ACCEPTABLE FAILURE RATE', isGood: true };
  if (value <= target * 10) return { rating: 'Medium', label: 'ELEVATED FAILURES', isGood: false };
  return { rating: 'Low', label: 'CRITICAL - HIGH FAILURE RATE', isGood: false };
};

/**
 * Grade Mean Time to Restore (lower is better)
 * Elite:  <= target
 * High:   <= 2x target
 * Medium: <= 5x target
 * Low:    > 5x target
 */
export const gradeMTTR = (value) => {
  const target = getThreshold('dora_mttr_limit', 18);
  if (value <= target) return { rating: 'Elite', label: 'RAPID RECOVERY', isGood: true };
  if (value <= target * 2) return { rating: 'High', label: 'HIGH PERFORMING', isGood: true };
  if (value <= target * 5) return { rating: 'Medium', label: 'SLOW RECOVERY', isGood: false };
  return { rating: 'Low', label: 'CRITICAL - EXTENDED OUTAGES', isGood: false };
};

/**
 * Get all grades at once for convenience
 */
export const gradeAllMetrics = (metrics) => {
  if (!metrics) return null;
  return {
    deploymentFrequency: gradeDeploymentFrequency(metrics.deploymentFrequency?.value || 0),
    leadTime: gradeLeadTime(metrics.leadTime?.value || 0),
    changeFailureRate: gradeChangeFailureRate(metrics.changeFailureRate?.value || 0),
    meanTimeToRestore: gradeMTTR(metrics.meanTimeToRestore?.value || 0),
  };
};
