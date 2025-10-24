/**
 * Simple structured logging wrapper
 * Uses console methods but provides consistent interface
 * Can be easily upgraded to pino or winston later
 */

function info(message, ...args) {
  console.log(`[INFO] ${message}`, ...args);
}

function warn(message, ...args) {
  console.warn(`[WARN] ${message}`, ...args);
}

function error(message, ...args) {
  console.error(`[ERROR] ${message}`, ...args);
}

module.exports = {
  info,
  warn,
  error
};
