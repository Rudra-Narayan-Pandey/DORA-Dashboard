/**
 * Custom logger utility for server logging.
 * Replaces heavy logging libraries to adhere strictly to Node.js dependency specifications.
 * Hardened to prevent sensitive credentials (PATs, Authorization headers) from leaking.
 */

const redactSensitiveData = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    return data
      .replace(/(Basic\s+)[A-Za-z0-9+/=]+/gi, '$1[REDACTED]')
      .replace(/(Bearer\s+)[A-Za-z0-9\-\._~\+\/]+=*/gi, '$1[REDACTED]');
  }

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  if (typeof data === 'object') {
    // If it's an Error instance, serialize it carefully
    if (data instanceof Error) {
      const errorObj = {
        name: data.name,
        message: redactSensitiveData(data.message),
        stack: redactSensitiveData(data.stack)
      };
      // Include Axios config/response specifics if present, redacting auth headers
      if (data.isAxiosError) {
        errorObj.code = data.code;
        errorObj.status = data.response ? data.response.status : null;
        if (data.config && data.config.headers) {
          const headers = { ...data.config.headers };
          for (const key of Object.keys(headers)) {
            if (key.toLowerCase() === 'authorization') {
              headers[key] = '[REDACTED]';
            }
          }
          errorObj.config = {
            url: data.config.url,
            method: data.config.method,
            headers
          };
        }
      }
      return errorObj;
    }

    const redacted = {};
    for (const [key, val] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'authorization' || lowerKey.includes('pat') || lowerKey === 'token' || lowerKey === 'password') {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactSensitiveData(val);
      }
    }
    return redacted;
  }

  return data;
};

const formatMessage = (level, message, durationMs = null) => {
  const timestamp = new Date().toISOString();
  const durationStr = durationMs !== null ? ` [${durationMs}ms]` : '';
  const sanitizedMsg = redactSensitiveData(message);
  return `[${timestamp}] [${level}]${durationStr} - ${sanitizedMsg}`;
};

const logger = {
  info: (message, durationMs = null) => {
    console.log('\x1b[32m%s\x1b[0m', formatMessage('INFO', message, durationMs));
  },
  warn: (message, durationMs = null) => {
    console.warn('\x1b[33m%s\x1b[0m', formatMessage('WARN', message, durationMs));
  },
  error: (message, error = null, durationMs = null) => {
    console.error('\x1b[31m%s\x1b[0m', formatMessage('ERROR', message, durationMs));
    if (error) {
      const redacted = redactSensitiveData(error);
      if (redacted.stack) {
        console.error('\x1b[90m%s\x1b[0m', redacted.stack);
      } else {
        console.error('\x1b[90m%s\x1b[0m', JSON.stringify(redacted, null, 2));
      }
    }
  }
};

module.exports = logger;
