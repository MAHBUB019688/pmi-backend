const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signAccessToken(user) {
  return jwt.sign(
    //payload
    {
      sub: user.id,
      phone: user.phone,
      type: "customer",
    },
    //secret
   // This is your private signing secret.
    env.jwtSecret,
    //options
    { expiresIn: env.jwtExpiresIn },
  );
}

function signAdminAccessToken(admin) {
  return jwt.sign(
    {
      sub: admin.id,
      email: admin.email,
      type: "admin",
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

module.exports = {
  signAccessToken,
  signAdminAccessToken,
  verifyAccessToken,
};
