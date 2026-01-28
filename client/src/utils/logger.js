/**
 * Logger utility for application-wide logging
 * In production, logs are suppressed or sent to a logging service
 * In development, logs are shown in the console
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4,
};

// Determine log level based on environment
const getLogLevel = () => {
  if (import.meta.env.PROD) {
    // In production, only log errors
    return LOG_LEVELS.ERROR;
  }
  // In development, log everything
  return LOG_LEVELS.DEBUG;
};

const currentLogLevel = getLogLevel();

/**
 * Log debug messages (development only)
 */
export const debug = (...args) => {
  if (currentLogLevel <= LOG_LEVELS.DEBUG) {
    console.debug('[DEBUG]', ...args);
  }
};

/**
 * Log info messages
 */
export const info = (...args) => {
  if (currentLogLevel <= LOG_LEVELS.INFO) {
    console.info('[INFO]', ...args);
  }
};

/**
 * Log warning messages
 */
export const warn = (...args) => {
  if (currentLogLevel <= LOG_LEVELS.WARN) {
    console.warn('[WARN]', ...args);
  }
  
  // In production, you might want to send warnings to a logging service
  if (import.meta.env.PROD) {
    // TODO: Send to logging service (e.g., Sentry, LogRocket, etc.)
    // logToService('warn', args);
  }
};

/**
 * Log error messages
 */
export const error = (...args) => {
  if (currentLogLevel <= LOG_LEVELS.ERROR) {
    console.error('[ERROR]', ...args);
  }
  
  // Always log errors to a service in production
  if (import.meta.env.PROD) {
    // TODO: Send to error tracking service (e.g., Sentry, LogRocket, etc.)
    // logToService('error', args);
  }
};

/**
 * Log API errors with context
 */
export const logApiError = (error, context = {}) => {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    url: error?.config?.url,
    method: error?.config?.method,
    ...context,
  };
  
  error('[API Error]', errorInfo);
  
  return errorInfo;
};

/**
 * Log authentication errors
 */
export const logAuthError = (error, context = {}) => {
  const errorInfo = {
    message: error?.message || 'Authentication failed',
    isAuthError: error?.isAuthError || false,
    ...context,
  };
  
  warn('[Auth Error]', errorInfo);
  
  return errorInfo;
};

export default {
  debug,
  info,
  warn,
  error,
  logApiError,
  logAuthError,
};
