const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 5000),
  corsOrigin: process.env.CORS_ORIGIN || "*",
};

env.isProduction = env.nodeEnv === "production";

module.exports = env;
