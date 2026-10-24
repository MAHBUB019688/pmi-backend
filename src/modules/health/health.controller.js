const prisma = require("../../db/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, fail } = require("../../utils/apiResponse");

const getHealth = asyncHandler(async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return success(res, {
      message: "Service is healthy",
      data: {
        status: "ok",
        database: "up",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return fail(res, {
      statusCode: 503,
      message: "Service is degraded",
      details: {
        status: "degraded",
        database: "down",
      },
    });
  }
});

module.exports = { getHealth };
