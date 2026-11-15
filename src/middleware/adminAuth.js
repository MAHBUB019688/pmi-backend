const prisma = require("../db/prisma");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/token");

function extractBearer(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7).trim();
}

async function loadAdminWithPermissions(adminId) {
  const admin = await prisma.adminUser.findUnique({
    where: { id: Number(adminId) },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!admin || !admin.status) return null;

  const roles = admin.roles.map((r) => r.role);
  const permissions = [
    ...new Set(
      roles.flatMap((role) =>
        role.permissions.map((rp) => rp.permission.slug),
      ),
    ),
  ];

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    status: admin.status,
    roles: roles.map((r) => ({ id: r.id, name: r.name, slug: r.slug })),
    permissions,
  };
}

const authenticateAdmin = asyncHandler(async (req, _res, next) => {
  const token = extractBearer(req);
  if (!token) throw new AppError("Unauthorized", 401);

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError("Unauthorized", 401);
  }

  if (payload.type !== "admin") {
    throw new AppError("Unauthorized", 401);
  }

  const admin = await loadAdminWithPermissions(payload.sub);
  if (!admin) throw new AppError("Unauthorized", 401);

  req.admin = admin;
  next();
});

function requirePermission(...slugs) {
  return asyncHandler(async (req, _res, next) => {
    if (!req.admin) throw new AppError("Unauthorized", 401);

    const isSuper = req.admin.roles.some((r) => r.slug === "super-admin");
    if (isSuper) return next();

    const allowed = slugs.some((slug) => req.admin.permissions.includes(slug));
    if (!allowed) throw new AppError("Forbidden", 403);

    next();
  });
}

module.exports = {
  authenticateAdmin,
  requirePermission,
  loadAdminWithPermissions,
};
