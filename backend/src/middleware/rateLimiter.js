const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : (parseInt(process.env.RATE_LIMIT_MAX, 10) || 2500),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Never choke development/local requests
    if (isDev) return true;
    const ip = req.ip || req.connection?.remoteAddress || '';
    if (ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1')) return true;
    return false;
  },
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP ${req.ip} on ${req.method} ${req.originalUrl}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again in a few moments.',
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (isDev) return true;
    return false;
  },
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts, please try again later.',
    });
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
