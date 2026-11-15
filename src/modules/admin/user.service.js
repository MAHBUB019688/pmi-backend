const bcrypt = require("bcryptjs");
const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const { getPagination, buildPagination } = require("../../utils/pagination");

function mapAdminUser(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    status: admin.status,
    roles: (admin.roles || []).map((r) => ({
      id: r.role.id,
      name: r.role.name,
      slug: r.role.slug,
    })),
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

function mapCustomer(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    isVerified: user.isVerified,
    isRestricted: user.isRestricted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    address: user.address || null,
    ordersCount: user._count?.orders,
  };
}

async function listAdminUsers(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.adminUser.count({ where }),
    prisma.adminUser.findMany({
      where,
      include: { roles: { include: { role: true } } },
      orderBy: { id: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    users: rows.map(mapAdminUser),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getAdminUser(id) {
  const admin = await prisma.adminUser.findUnique({
    where: { id: Number(id) },
    include: { roles: { include: { role: true } } },
  });
  if (!admin) throw new AppError("Admin user not found", 404);
  return mapAdminUser(admin);
}

async function createAdminUser(body) {
  if (!body.password) throw new AppError("Password is required", 400);

  const existing = await prisma.adminUser.findUnique({
    where: { email: body.email },
  });
  if (existing) throw new AppError("Email already in use", 409);

  const passwordHash = await bcrypt.hash(body.password, 10);
  const roleIds = Array.isArray(body.roleIds) ? body.roleIds.map(Number) : [];

  const admin = await prisma.adminUser.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      passwordHash,
      status: body.status ?? true,
      roles: roleIds.length
        ? { create: roleIds.map((roleId) => ({ roleId })) }
        : undefined,
    },
    include: { roles: { include: { role: true } } },
  });

  return mapAdminUser(admin);
}

async function updateAdminUser(id, body) {
  const existing = await prisma.adminUser.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Admin user not found", 404);

  if (body.email && body.email !== existing.email) {
    const clash = await prisma.adminUser.findUnique({
      where: { email: body.email },
    });
    if (clash) throw new AppError("Email already in use", 409);
  }

  const passwordHash = body.password
    ? await bcrypt.hash(body.password, 10)
    : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.adminUser.update({
      where: { id: existing.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
        ...(body.phone !== undefined ? { phone: body.phone || null } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    if (Array.isArray(body.roleIds)) {
      await tx.adminUserRole.deleteMany({ where: { adminUserId: existing.id } });
      if (body.roleIds.length) {
        await tx.adminUserRole.createMany({
          data: body.roleIds.map((roleId) => ({
            adminUserId: existing.id,
            roleId: Number(roleId),
          })),
        });
      }
    }
  });

  return getAdminUser(existing.id);
}

async function deleteAdminUser(id) {
  const existing = await prisma.adminUser.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Admin user not found", 404);
  await prisma.adminUser.delete({ where: { id: existing.id } });
  return null;
}

async function listCustomers(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: {
        address: true,
        _count: { select: { orders: true } },
      },
      orderBy: { id: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    customers: rows.map(mapCustomer),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getCustomer(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      address: true,
      orders: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { orders: true } },
    },
  });
  if (!user) throw new AppError("Customer not found", 404);
  return {
    ...mapCustomer(user),
    orders: user.orders,
  };
}

async function updateCustomer(id, body) {
  const existing = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Customer not found", 404);

  const user = await prisma.user.update({
    where: { id: existing.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.isVerified !== undefined ? { isVerified: body.isVerified } : {}),
      ...(body.isRestricted !== undefined
        ? { isRestricted: body.isRestricted }
        : {}),
      ...(body.gender !== undefined ? { gender: body.gender } : {}),
    },
    include: {
      address: true,
      _count: { select: { orders: true } },
    },
  });

  return mapCustomer(user);
}

module.exports = {
  listAdminUsers,
  getAdminUser,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  listCustomers,
  getCustomer,
  updateCustomer,
};
