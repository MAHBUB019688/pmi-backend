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
  jwtSecret: process.env.JWT_SECRET || "dev-change-me-pmi-ecommerce",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  otpExpiryMinutes: toNumber(process.env.OTP_EXPIRY_MINUTES, 5),
  otpLength: toNumber(process.env.OTP_LENGTH, 6),
  // In development, OTP is returned in API response for testing.
  exposeOtp: (process.env.EXPOSE_OTP || "true") === "true",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "",

  // SMTP / email (Gmail app password recommended for development)
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: toNumber(process.env.SMTP_PORT, 587),
  smtpSecure: (process.env.SMTP_SECURE || "false") === "true",
  smtpUser: process.env.SMTP_USER || process.env.EMAIL_USER || "",
  smtpPass: process.env.SMTP_PASS || process.env.EMAIL_PASS || "",
  mailFrom:
    process.env.MAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    "noreply@carpediem.local",
};

env.isProduction = env.nodeEnv === "production";

module.exports = env;
