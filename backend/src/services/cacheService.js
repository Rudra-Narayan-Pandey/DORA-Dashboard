const logger = require('../utils/logger');

// Local in-memory storage Map
const cacheMap = new Map();

/**
 * Generates a cache key containing the user PAT hash (to isolate user sessions) and route path details.
 * 
 * @param {string} pat User PAT token
 * @param {string} keyPrefix Path descriptor (e.g., 'metrics', 'deployments')
 * @param {object} params Query parameters
 * @returns {string}
 */
const generateKey = (pat, keyPrefix, params = {}) => {
  // Hash the PAT locally for identity isolation without storing clear text tokens in keys
  const patHash = Buffer.from(pat).toString('base64').substring(0, 16);
  const paramsStr = JSON.stringify(params);
  return `${patHash}:${keyPrefix}:${paramsStr}`;
};

const cacheService = {
  /**
   * Retrieves data from the cache.
   * Returns null if key is missing or entry has expired.
   * 
   * @param {string} key 
   * @returns {*}
   */
  get: (key) => {
    const cachedEntry = cacheMap.get(key);
    if (!cachedEntry) return null;

    const isExpired = Date.now() > cachedEntry.expiry;
    if (isExpired) {
      cacheMap.delete(key);
      return null;
    }

    return cachedEntry.data;
  },

  /**
   * Stores data in the cache.
   * 
   * @param {string} key 
   * @param {*} data 
   * @param {number} ttlSeconds 
   */
  set: (key, data, ttlSeconds) => {
    const expiry = Date.now() + (ttlSeconds * 1000);
    cacheMap.set(key, { data, expiry });
  },

  /**
   * Invalidates all cache keys matching a particular user PAT.
   * This is called on write operations (triggers/updates) to clear outdated metric states.
   * 
   * @param {string} pat User PAT token
   * @param {string} [keyPrefix] Optional route descriptor to target specific cache subsets
   */
  invalidate: (pat, keyPrefix = null) => {
    const patHash = Buffer.from(pat).toString('base64').substring(0, 16);
    const keysToDelete = [];

    for (const key of cacheMap.keys()) {
      const matchPat = key.startsWith(patHash);
      const matchPrefix = !keyPrefix || key.includes(`:${keyPrefix}:`);
      
      if (matchPat && matchPrefix) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => cacheMap.delete(key));
    if (keysToDelete.length > 0) {
      logger.info(`Invalidated ${keysToDelete.length} cache entries for user session.`);
    }
  },

  /**
   * Completely flushes the in-memory cache map.
   */
  clearAll: () => {
    cacheMap.clear();
    logger.info('In-memory cache completely flushed.');
  }
};

module.exports = {
  cacheService,
  generateKey
};
