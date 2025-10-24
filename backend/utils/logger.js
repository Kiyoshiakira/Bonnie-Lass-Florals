/**
 * Structured logging using Pino
 * Provides fast, JSON-formatted logging with proper levels
 */
const pino = require('pino');

// Configure pretty printing for development
const transport = process.env.NODE_ENV !== 'production' ? {
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname'
  }
} : undefined;

// Create logger with pretty printing in development
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport
});

// Helper function to handle logging with optional arguments
function logWithArgs(loggerMethod, message, args) {
  if (args.length > 0) {
    loggerMethod({ data: args }, message);
  } else {
    loggerMethod(message);
  }
}

// Export wrapper functions for backward compatibility
function info(message, ...args) {
  logWithArgs(logger.info.bind(logger), message, args);
}

function warn(message, ...args) {
  logWithArgs(logger.warn.bind(logger), message, args);
}

function error(message, ...args) {
  logWithArgs(logger.error.bind(logger), message, args);
}

module.exports = {
  info,
  warn,
  error,
  // Export the pino logger instance for advanced usage
  logger
};
