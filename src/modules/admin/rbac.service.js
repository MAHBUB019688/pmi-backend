const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const slugify = require("../../utils/slugify");
const { getPagination, buildPagination } = require("../../utils/pagination");

function mapRole(role) {
  return {
    id: role.id,
    name: role.name,
    slug: role.slug,
    description: role.description,
    status: role.status,
    permissions: (role.permissions || []).map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      slug: rp.permission.slug,
      groupName: rp.permission.groupName,
    })),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

function mapPermission(p) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    groupName: p.groupName,
    description: p.description,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

async function uniqueRoleSlug(base, excludeId) {
  let slug = slugify(base) || "role";
  let candidate = slug;
  let i = 1;
  while (true) {
    const existing = await prisma.role.findUnique({ where: { slug: candidate } });
    if (!existing || (excludeId && existing.id === excludeId)) return candidate;
    candidate = `${slug}-${i++}`;
  }
}

async function listRoles(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { slug: { contains: s, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.role.count({ where }),
    prisma.role.findMany({
      where,
      include: {
        permissions: { include: { permission: true } },
      },
      orderBy: { id: "asc" },
      skip,
      take,
    }),
  ]);

  return {
    roles: rows.map(mapRole),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getRole(id) {
  const role = await prisma.role.findUnique({
    where: { id: Number(id) },
    include: { permissions: { include: { permission: true } } },
  });
  if (!role) throw new AppError("Role not found", 404);
  return mapRole(role);
}

async function createRole(body) {
  const slug = await uniqueRoleSlug(body.slug || body.name);
  const permissionIds = Array.isArray(body.permissionIds)
    ? body.permissionIds.map(Number)
    : [];

  const role = await prisma.role.create({
    data: {
      name: body.name,
      slug,
      description: body.description ?? null,
      status: body.status ?? true,
      permissions: permissionIds.length
        ? {
            create: permissionIds.map((permissionId) => ({ permissionId })),
          }
        : undefined,
    },
    include: { permissions: { include: { permission: true } } },
  });

  return mapRole(role);
}

async function updateRole(id, body) {
  const existing = await prisma.role.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Role not found", 404);

  const slug =
    body.slug !== undefined || body.name !== undefined
      ? await uniqueRoleSlug(body.slug || body.name || existing.name, existing.id)
      : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.role.update({
      where: { id: existing.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });

    if (Array.isArray(body.permissionIds)) {
      await tx.rolePermission.deleteMany({ where: { roleId: existing.id } });
      if (body.permissionIds.length) {
        await tx.rolePermission.createMany({
          data: body.permissionIds.map((permissionId) => ({
            roleId: existing.id,
            permissionId: Number(permissionId),
          })),
        });
      }
    }
  });

  return getRole(existing.id);
}

async function deleteRole(id) {
  const existing = await prisma.role.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Role not found", 404);
  if (existing.slug === "super-admin") {
    throw new AppError("Cannot delete Super Admin role", 400);
  }
  await prisma.role.delete({ where: { id: existing.id } });
  return null;
}

async function listPermissions() {
  const rows = await prisma.permission.findMany({
    orderBy: [{ groupName: "asc" }, { slug: "asc" }],
  });
  return rows.map(mapPermission);
}

async function createPermission(body) {
  const slug = slugify(body.slug || body.name);
  const existing = await prisma.permission.findUnique({ where: { slug } });
  if (existing) throw new AppError("Permission slug already exists", 409);

  const permission = await prisma.permission.create({
    data: {
      name: body.name,
      slug,
      groupName: body.groupName ?? null,
      description: body.description ?? null,
    },
  });
  return mapPermission(permission);
}

module.exports = {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  listPermissions,
  createPermission,
};
