const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 5000),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  databaseUrl: required("DATABASE_URL"),
};

env.isProduction = env.nodeEnv === "production";

module.exports = env;
