const { sendError } = require('../utils/apiResponse');

/**
 * Restricts access to specified roles (e.g. 'ADMIN').
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Access denied: Insufficient permissions', 403);
    }

    next();
  };
}

module.exports = {
  authorizeRoles,
};
