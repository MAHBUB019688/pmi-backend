class AppError extends Error {
  constructor(message, statusCode = 500, details, errors) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.errors = errors;
    this.isOperational = true;
  }
}

module.exports = AppError;
