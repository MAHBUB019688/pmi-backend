const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const slugify = require("../../utils/slugify");
const { getPagination, buildPagination } = require("../../utils/pagination");

function mapVendor(v) {
  return {
    id: v.id,
    businessName: v.businessName,
    contactName: v.contactName,
    email: v.email,
    phone: v.phone,
    address: v.address,
    notes: v.notes,
    status: v.status,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    categoryRequests: v.categoryRequests,
  };
}

function mapCategoryRequest(r) {
  return {
    id: r.id,
    vendorId: r.vendorId,
    title: r.title,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    vendor: r.vendor
      ? {
          id: r.vendor.id,
          businessName: r.vendor.businessName,
          contactName: r.vendor.contactName,
          email: r.vendor.email,
          phone: r.vendor.phone,
        }
      : null,
  };
}

async function listVendors(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { businessName: { contains: s, mode: "insensitive" } },
      { contactName: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.vendor.count({ where }),
    prisma.vendor.findMany({
      where,
      include: { categoryRequests: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    vendors: rows.map(mapVendor),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getVendor(id) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: Number(id) },
    include: { categoryRequests: true },
  });
  if (!vendor) throw new AppError("Vendor not found", 404);
  return mapVendor(vendor);
}

async function createVendor(body) {
  const vendor = await prisma.vendor.create({
    data: {
      businessName: body.businessName,
      contactName: body.contactName ?? null,
      email: body.email ?? null,
      phone: body.phone,
      address: body.address ?? null,
      notes: body.notes ?? null,
      status: body.status || "pending",
    },
    include: { categoryRequests: true },
  });
  return mapVendor(vendor);
}

async function registerVendor(body) {
  return createVendor({
    businessName: body.businessName,
    contactName: body.contactName,
    email: body.email,
    phone: body.phone,
    address: body.address,
    status: "pending",
  });
}

async function approveVendor(id) {
  const existing = await prisma.vendor.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Vendor not found", 404);

  const vendor = await prisma.vendor.update({
    where: { id: existing.id },
    data: { status: "approved", notes: existing.notes },
    include: { categoryRequests: true },
  });
  return mapVendor(vendor);
}

async function rejectVendor(id, notes) {
  const existing = await prisma.vendor.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Vendor not found", 404);

  const vendor = await prisma.vendor.update({
    where: { id: existing.id },
    data: {
      status: "rejected",
      ...(notes !== undefined ? { notes } : {}),
    },
    include: { categoryRequests: true },
  });
  return mapVendor(vendor);
}

async function listCategoryRequests(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.status) where.status = query.status;

  const [total, rows] = await Promise.all([
    prisma.categoryRequest.count({ where }),
    prisma.categoryRequest.findMany({
      where,
      include: { vendor: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    categoryRequests: rows.map(mapCategoryRequest),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function approveCategoryRequest(id, options = {}) {
  const existing = await prisma.categoryRequest.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Category request not found", 404);

  const result = await prisma.$transaction(async (tx) => {
    const request = await tx.categoryRequest.update({
      where: { id: existing.id },
      data: { status: "approved" },
      include: { vendor: true },
    });

    let category = null;
    if (options.createCategory !== false) {
      const baseSlug = slugify(options.slug || existing.title) || "category";
      let slug = baseSlug;
      let i = 1;
      while (await tx.category.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${i++}`;
      }
      category = await tx.category.create({
        data: {
          title: options.title || existing.title,
          slug,
          image: options.image ?? null,
          sortOrder: options.sortOrder ?? 0,
          status: true,
        },
      });
    }

    return { request, category };
  });

  return {
    categoryRequest: mapCategoryRequest(result.request),
    category: result.category,
  };
}

async function rejectCategoryRequest(id) {
  const existing = await prisma.categoryRequest.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Category request not found", 404);

  const request = await prisma.categoryRequest.update({
    where: { id: existing.id },
    data: { status: "rejected" },
    include: { vendor: true },
  });

  return mapCategoryRequest(request);
}

module.exports = {
  listVendors,
  getVendor,
  createVendor,
  registerVendor,
  approveVendor,
  rejectVendor,
  listCategoryRequests,
  approveCategoryRequest,
  rejectCategoryRequest,
};
