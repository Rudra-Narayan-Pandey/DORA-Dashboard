/**
 * DORA Metrics threshold rules and rating classification mapping.
 * Standards align with standard DORA metrics definition models.
 * Hardened to prevent rounding and empty state mismatches.
 */

/**
 * Classifies Deployment Frequency rating based on daily deployments average.
 * @param {number} dailyAvg 
 * @returns {'Elite'|'High'|'Medium'|'Low'}
 */
const getDeploymentFrequencyRating = (dailyAvg) => {
  if (dailyAvg === null || dailyAvg === undefined || dailyAvg < 0.05) return 'Low';
  if (dailyAvg >= 3.0) return 'Elite';
  if (dailyAvg >= 0.14) return 'High'; // ~1 deploy/week
  if (dailyAvg >= 0.05) return 'Medium'; // ~1 deploy/month (aligned with 0.1 rounded threshold)
  return 'Low';
};

/**
 * Classifies Lead Time for Changes rating based on average hours.
 * @param {number|null} hours 
 * @returns {'Elite'|'High'|'Medium'|'Low'}
 */
const getLeadTimeRating = (hours) => {
  if (hours === null || hours === undefined || hours < 0) return 'Low';
  if (hours === 0) return 'Low'; // 0 due to no successful deployments should be Low
  if (hours < 1.0) return 'Elite'; // < 1 hour
  if (hours <= 24.0) return 'High'; // 1 day
  if (hours <= 168.0) return 'Medium'; // 1 week
  return 'Low';
};

/**
 * Classifies Change Failure Rate rating based on percentage.
 * @param {number} percentage 
 * @returns {'Elite'|'High'|'Medium'|'Low'}
 */
const getChangeFailureRateRating = (percentage) => {
  if (percentage === null || percentage === undefined) return 'Elite';
  if (percentage <= 5.0) return 'Elite';
  if (percentage <= 15.0) return 'High';
  if (percentage <= 30.0) return 'Medium';
  return 'Low';
};

/**
 * Classifies Mean Time to Restore rating based on average duration in minutes.
 * @param {number} minutes 
 * @returns {'Elite'|'High'|'Medium'|'Low'}
 */
const getMeanTimeToRestoreRating = (minutes) => {
  if (minutes === null || minutes === undefined || minutes <= 0) return 'Elite';
  if (minutes < 60.0) return 'Elite'; // < 1 hour
  if (minutes <= 1440.0) return 'High'; // 1 day
  if (minutes <= 10080.0) return 'Medium'; // 1 week
  return 'Low';
};

module.exports = {
  getDeploymentFrequencyRating,
  getLeadTimeRating,
  getChangeFailureRateRating,
  getMeanTimeToRestoreRating
};
