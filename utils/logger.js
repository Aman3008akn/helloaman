const winston = require('winston');

/**
 * Winston Logger Configuration
 * Handles logging to console, file, and potentially external services
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'telegram-escrow-bot' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File output for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    
    // File output for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

/**
 * Create a log entry in the database
 * @param {Object} params - Log parameters
 */
const logToDatabase = async (params) => {
  try {
    const Log = require('../models/Log');
    await Log.create(params);
  } catch (error) {
    logger.error('Failed to save log to database:', error);
  }
};

module.exports = {
  logger,
  logToDatabase,
};
