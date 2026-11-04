const logger = require('../config/logger');
const { sendError } = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  logger.error({ err, path: req.path, method: req.method }, err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma Database Connection / Timeout Errors
  if (err.code === 'P1001' || err.code === 'P1002' || err.code === 'P1008') {
    statusCode = 503;
    message = 'Database connection temporarily unavailable. The database may be waking up from sleep. Please try again in a moment.';
  }

  return sendError(res, message, statusCode, err.errors || null);
}

module.exports = errorHandler;
