const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      phone: user.phone,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = { signAccessToken, verifyAccessToken };
