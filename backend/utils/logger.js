/**
 * Structured logging using Pino
 * Provides fast, JSON-formatted logging with proper levels
 */
const pino = require('pino');

// Create logger with pretty printing in development
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
});

// Export wrapper functions for backward compatibility
function info(message, ...args) {
  if (args.length > 0) {
    logger.info({ data: args }, message);
  } else {
    logger.info(message);
  }
}

function warn(message, ...args) {
  if (args.length > 0) {
    logger.warn({ data: args }, message);
  } else {
    logger.warn(message);
  }
}

function error(message, ...args) {
  if (args.length > 0) {
    logger.error({ data: args }, message);
  } else {
    logger.error(message);
  }
}

module.exports = {
  info,
  warn,
  error,
  // Export the pino logger instance for advanced usage
  logger
};
