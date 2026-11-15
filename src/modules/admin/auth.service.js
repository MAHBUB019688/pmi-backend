const bcrypt = require("bcryptjs");
const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const { signAdminAccessToken } = require("../../utils/token");
const { loadAdminWithPermissions } = require("../../middleware/adminAuth");

async function login({ emailOrPhone, password }) {
  const identifier = String(emailOrPhone || "").trim();
  if (!identifier || !password) {
    throw new AppError("Email/phone and password are required", 400);
  }

  const admin = await prisma.adminUser.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });

  if (!admin || !admin.status) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw new AppError("Invalid credentials", 401);
  }

  const profile = await loadAdminWithPermissions(admin.id);
  if (!profile) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signAdminAccessToken(admin);

  return {
    token,
    admin: {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      roles: profile.roles,
      permissions: profile.permissions,
    },
  };
}

async function me(adminId) {
  const profile = await loadAdminWithPermissions(adminId);
  if (!profile) throw new AppError("Unauthorized", 401);
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    roles: profile.roles,
    permissions: profile.permissions,
  };
}

module.exports = { login, me };
