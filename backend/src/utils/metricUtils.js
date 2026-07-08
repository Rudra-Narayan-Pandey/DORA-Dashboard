/**
 * DORA Metrics threshold rules and rating classification mapping.
 * Standards align with standard DORA metrics definition models.
 */

/**
 * Classifies Deployment Frequency rating based on daily deployments average.
 * @param {number} dailyAvg 
 * @returns {'Elite'|'High'|'Medium'|'Low'}
 */
const getDeploymentFrequencyRating = (dailyAvg) => {
  if (dailyAvg >= 3.0) return 'Elite';
  if (dailyAvg >= 0.14) return 'High'; // ~1 deploy/week
  if (dailyAvg >= 0.03) return 'Medium'; // ~1 deploy/month
  return 'Low';
};

/**
 * Classifies Lead Time for Changes rating based on average hours.
 * @param {number} hours 
 * @returns {'Elite'|'High'|'Medium'|'Low'}
 */
const getLeadTimeRating = (hours) => {
  if (hours <= 0) return 'Elite'; // Default to Elite for instant/empty
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
  if (minutes <= 0) return 'Elite';
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
