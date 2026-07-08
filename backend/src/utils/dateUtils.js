/**
 * Date and time range utilities for parsing query parameters
 * and filtering Azure DevOps API requests.
 */

/**
 * Returns a Date object representing the start date of the given timeframe range.
 * 
 * @param {string} range Shorthand timeframe range ('7d', '30d', '90d', 'all')
 * @returns {Date|null} Start date or null if retrieving all historical data
 */
const getDateRangeStart = (range) => {
  if (!range) return null;
  
  const now = new Date();
  switch (range.toLowerCase()) {
    case '7d':
      now.setDate(now.getDate() - 7);
      return now;
    case '30d':
      now.setDate(now.getDate() - 30);
      return now;
    case '90d':
      now.setDate(now.getDate() - 90);
      return now;
    case 'all':
    default:
      return null;
  }
};

/**
 * Formats a Date object to a safe ISO string format for Azure DevOps queries.
 * 
 * @param {Date} date 
 * @returns {string}
 */
const formatAzureDate = (date) => {
  if (!date) return '';
  return date.toISOString();
};

module.exports = {
  getDateRangeStart,
  formatAzureDate
};
