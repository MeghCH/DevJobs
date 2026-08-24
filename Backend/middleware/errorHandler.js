// Error handling middleware

/**
 * Error handler middleware to handle errors in a consistent manner.
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error(err.stack);

  // Set the status code
  const statusCode = err.statusCode || 500;

  // Set the response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
    },
  });
};

/**
 * Not found handler middleware to handle 404 errors.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Not Found',
      status: 404,
    },
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};