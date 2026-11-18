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

function cleanEnv(value = "") {
  return String(value)
    .trim()
    .replace(/^['"]|['"]$/g, "");
}

const smtpUser = cleanEnv(process.env.SMTP_USER || process.env.EMAIL_USER || "");
const smtpPass = cleanEnv(process.env.SMTP_PASS || process.env.EMAIL_PASS || "")
  .replace(/\s+/g, "");

const mailFromRaw = cleanEnv(process.env.MAIL_FROM || "");
const mailFrom =
  mailFromRaw ||
  (smtpUser ? `CARPE DIEM <${smtpUser}>` : "CARPE DIEM <noreply@carpediem.local>");

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: toNumber(process.env.PORT, 5000),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: process.env.JWT_SECRET || "dev-change-me-pmi-ecommerce",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  otpExpiryMinutes: toNumber(process.env.OTP_EXPIRY_MINUTES, 5),
  otpLength: toNumber(process.env.OTP_LENGTH, 6),
  exposeOtp: (process.env.EXPOSE_OTP || "true") === "true",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",

  smtpHost: cleanEnv(process.env.SMTP_HOST || "smtp.gmail.com"),
  smtpPort: toNumber(process.env.SMTP_PORT, 587),
  smtpSecure: (process.env.SMTP_SECURE || "false") === "true",
  smtpUser,
  smtpPass,
  mailFrom,

  upstashRedisRestUrl: cleanEnv(process.env.UPSTASH_REDIS_REST_URL || ""),
  upstashRedisRestToken: cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN || ""),
  redisCacheTtlSeconds: toNumber(process.env.REDIS_CACHE_TTL_SECONDS, 60),
  redisEnabled: (process.env.REDIS_ENABLED || "true") === "true",
};

env.isProduction = env.nodeEnv === "production";
env.redisConfigured = Boolean(
  env.redisEnabled && env.upstashRedisRestUrl && env.upstashRedisRestToken,
);

module.exports = env;
