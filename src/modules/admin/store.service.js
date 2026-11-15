const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const { getPagination, buildPagination } = require("../../utils/pagination");

function mapStore(store) {
  return {
    id: store.id,
    name: store.name,
    address: store.address,
    description: store.description,
    latitude: Number(store.latitude),
    longitude: Number(store.longitude),
    status: store.status,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };
}

async function listStores(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { address: { contains: s, mode: "insensitive" } },
    ];
  }
  if (query.status !== undefined && query.status !== "") {
    where.status = query.status === "true" || query.status === true || query.status === "1";
  }

  const [total, rows] = await Promise.all([
    prisma.store.count({ where }),
    prisma.store.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
    }),
  ]);

  return {
    stores: rows.map(mapStore),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getStore(id) {
  const store = await prisma.store.findUnique({ where: { id: Number(id) } });
  if (!store) throw new AppError("Store not found", 404);
  return mapStore(store);
}

async function createStore(body) {
  const store = await prisma.store.create({
    data: {
      name: body.name,
      address: body.address,
      description: body.description ?? null,
      latitude: body.latitude,
      longitude: body.longitude,
      status: body.status ?? true,
    },
  });
  return mapStore(store);
}

async function updateStore(id, body) {
  const existing = await prisma.store.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Store not found", 404);

  const store = await prisma.store.update({
    where: { id: existing.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.address !== undefined ? { address: body.address } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.latitude !== undefined ? { latitude: body.latitude } : {}),
      ...(body.longitude !== undefined ? { longitude: body.longitude } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  });
  return mapStore(store);
}

async function deleteStore(id) {
  const existing = await prisma.store.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Store not found", 404);
  await prisma.store.delete({ where: { id: existing.id } });
  return null;
}

module.exports = {
  listStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
};
