const { sendError } = require('../utils/apiResponse');

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return sendError(res, 'Validation error', 400, formattedErrors);
    }
    req.body = result.data;
    next();
  };
}

module.exports = {
  validateBody,
};
