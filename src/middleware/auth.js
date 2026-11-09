const prisma = require("../db/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/token");

function extractBearer(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractBearer(req);
  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
  });

  if (!user) {
    throw new AppError("Unauthorized", 401);
  }

  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractBearer(req);
  if (!token) return next();

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
    });
    if (user) req.user = user;
  } catch {
    // ignore invalid token for optional routes
  }

  next();
});

module.exports = { authenticate, optionalAuth };
