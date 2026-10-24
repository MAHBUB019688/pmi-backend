const { Prisma } = require("@prisma/client");
const AppError = require("../utils/AppError");

function mapPrismaError(err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return new AppError("A record with this value already exists", 409, {
          fields: err.meta?.target,
        });
      case "P2025":
        return new AppError("Record not found", 404);
      case "P2003":
        return new AppError("Related record not found", 400);
      default:
        return new AppError("Database request failed", 400, { code: err.code });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new AppError("Invalid database query", 400);
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new AppError("Database unavailable", 503);
  }

  return null;
}

module.exports = mapPrismaError;
