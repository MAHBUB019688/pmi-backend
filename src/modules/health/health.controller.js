const prisma = require("../../db/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { success, fail } = require("../../utils/apiResponse");
const { isRedisReady, cacheGet, cacheSet } = require("../../utils/cache");

const getHealth = asyncHandler(async (_req, res) => {
  let database = "down";
  let redis = isRedisReady() ? "down" : "disabled";

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = "up";
  } catch {
    // keep database = down
  }

  if (isRedisReady()) {
    try {
      const probeKey = "health:redis:ping";
      await cacheSet(probeKey, "ok", 10);
      const probe = await cacheGet(probeKey);
      redis = probe === "ok" ? "up" : "down";
    } catch {
      redis = "down";
    }
  }

  const healthy = database === "up";
  const payload = {
    status: healthy ? "ok" : "degraded",
    database,
    redis,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  if (!healthy) {
    return fail(res, {
      statusCode: 503,
      message: "Service is degraded",
      details: payload,
    });
  }

  return success(res, {
    message: "Service is healthy",
    data: payload,
  });
});

module.exports = { getHealth };
