const crypto = require("crypto");
const env = require("../config/env");

function generateOtp() {
  const max = 10 ** env.otpLength;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(env.otpLength, "0");
}

function otpExpiresAt() {
  return new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);
}

module.exports = { generateOtp, otpExpiresAt };
