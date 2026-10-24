const env = require("../config/env");
const AppError = require("../utils/AppError");
const mapPrismaError = require("../db/mapPrismaError");

function errorHandler(err, _req, res, _next) {
  err = mapPrismaError(err) || err;

  const statusCode = err.statusCode || 500;
  const isOperational = err instanceof AppError || err.isOperational;

  if (!isOperational || statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? err.message : "Internal server error",
    details: err.details,
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
}

module.exports = errorHandler;
