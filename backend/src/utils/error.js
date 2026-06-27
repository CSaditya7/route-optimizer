/**
 * Operational error with an HTTP status code.
 * Thrown deliberately by controllers/services to produce clean API error responses.
 */
export class AppError extends Error {
  /**
   * @param {string} message  - human-readable error description
   * @param {number} status   - HTTP status code (default 500)
   */
  constructor(message, status = 500) {
    super(message);
    this.name = "AppError";
    this.status = status;
    Error.captureStackTrace?.(this, AppError);
  }
}

/**
 * Wrap an async Express route handler so that any rejected promise is passed
 * to next() without needing try/catch in every controller.
 *
 * Usage:
 *   router.post("/foo", asyncWrap(myAsyncHandler));
 *
 * @param {Function} fn - async (req, res, next) => void
 */
export function asyncWrap(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 handler — mounted after all routes.
 */
export function notFound(req, res, _next) {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.path}`,
  });
}

/**
 * Global error handler — must have 4 parameters for Express to recognise it.
 */
export function errorHandler(err, _req, res, _next) {
  const isDev = process.env.NODE_ENV !== "production";

  // Log unexpected errors
  if (!err.status || err.status >= 500) {
    console.error("[error]", err);
  }

  const status = err.status || 500;
  const message =
    err instanceof AppError
      ? err.message
      : isDev
      ? err.message
      : "An internal error occurred.";

  res.status(status).json({
    error: message,
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  });
}
