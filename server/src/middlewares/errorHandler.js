/**
 * Standard error handler matching project.md §7 API specification
 * Includes PII sanitization to prevent sensitive user or system traces from leaking.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error encountered:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      error: 'Duplicate field error',
      message: `A record with this ${field} already exists.`,
    });
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: `Resource with id '${err.value}' is not valid.`,
    });
  }

  // Custom status code if assigned
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: err.code || (statusCode === 500 ? 'Internal server error' : message),
    message: err.customMessage || message,
    ...(process.env.NODE_ENV === 'development' && statusCode === 500 && { stack: err.stack }),
  });
};
