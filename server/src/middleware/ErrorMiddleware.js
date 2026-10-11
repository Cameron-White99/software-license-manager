function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    return res.status(400).json({ message: `That ${field.replace(/_/g, ' ')} is already in use.` });
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)[0]?.message || 'Invalid data.';
    return res.status(400).json({ message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id.' });
  }

  console.error(err);
  return res.status(500).json({ message: 'Server error.' });
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export { createError, errorHandler, asyncHandler };
