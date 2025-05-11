/**
 * Error Handler Module
 * 
 * This module provides centralized error handling functionality for the application,
 * including error logging, formatting, and user-friendly error messages.
 */

// Error types
const ERROR_TYPES = {
  API: 'API_ERROR',
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

// User-friendly error messages
const ERROR_MESSAGES = {
  [ERROR_TYPES.API]: 'There was an issue with the game data service.',
  [ERROR_TYPES.NETWORK]: 'Unable to connect to the game service. Please check your internet connection.',
  [ERROR_TYPES.AUTH]: 'Authentication failed. Please try again later.',
  [ERROR_TYPES.VALIDATION]: 'The request contains invalid data.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested game or resource was not found.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again later.'
}

/**
 * Create a standardized error object
 * @param {string} type - Error type from ERROR_TYPES
 * @param {string} message - Detailed error message
 * @param {any} details - Additional error details
 * @returns {Object} - Standardized error object
 */
function createError(type = ERROR_TYPES.UNKNOWN, message = null, details = null) {
  return {
    type,
    message: message || ERROR_MESSAGES[type],
    userMessage: ERROR_MESSAGES[type],
    details,
    timestamp: new Date().toISOString()
  }
}

/**
 * Handle API errors and convert them to standardized format
 * @param {Error} error - The caught error
 * @param {string} context - Context where the error occurred
 * @returns {Object} - Standardized error object
 */
function handleApiError(error, context = '') {
  console.error(`API Error in ${context}:`, error)
  
  // Determine error type based on the error
  let errorType = ERROR_TYPES.UNKNOWN
  
  if (error.message && error.message.includes('network')) {
    errorType = ERROR_TYPES.NETWORK
  } else if (error.status === 401 || error.status === 403) {
    errorType = ERROR_TYPES.AUTH
  } else if (error.status === 404) {
    errorType = ERROR_TYPES.NOT_FOUND
  } else if (error.status === 400 || error.status === 422) {
    errorType = ERROR_TYPES.VALIDATION
  } else if (error.status) {
    errorType = ERROR_TYPES.API
  }
  
  return createError(errorType, error.message, {
    context,
    originalError: process.env.NODE_ENV === 'development' ? error : undefined,
    status: error.status
  })
}

/**
 * Log an error to the console (and potentially to a monitoring service)
 * @param {Object} error - Error object
 * @param {string} context - Context where the error occurred
 */
function logError(error, context = '') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    context,
    error
  }
  
  console.error('Error:', logEntry)
  
  // In a production app, you might send this to a logging service
  // Example: sendToLoggingService(logEntry)
}

/**
 * Get a user-friendly error message
 * @param {Object|Error} error - Error object
 * @returns {string} - User-friendly error message
 */
function getUserFriendlyMessage(error) {
  if (error.userMessage) {
    return error.userMessage
  }
  
  if (error.type && ERROR_MESSAGES[error.type]) {
    return ERROR_MESSAGES[error.type]
  }
  
  return ERROR_MESSAGES[ERROR_TYPES.UNKNOWN]
}

module.exports = {
  ERROR_TYPES,
  ERROR_MESSAGES,
  createError,
  handleApiError,
  logError,
  getUserFriendlyMessage
}
