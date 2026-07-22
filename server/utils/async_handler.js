// Wraps an async route handler so any thrown error is passed to Express's
// error middleware instead of crashing the request. Saves a try/catch everywhere.

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
