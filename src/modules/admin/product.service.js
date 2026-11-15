const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const slugify = require("../../utils/slugify");
const { getPagination, buildPagination } = require("../../utils/pagination");
const { decimalToNumber } = require("../../utils/serializers");

async function uniqueProductSlug(base, excludeId) {
  let slug = slugify(base) || "product";
  let candidate = slug;
  let i = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug: candidate } });
    if (!existing || (excludeId && existing.id === excludeId)) return candidate;
    candidate = `${slug}-${i++}`;
  }
}

function mapProduct(row) {
  return {
    id: row.id,
    categoryId: row.categoryId,
    category: row.category
      ? { id: row.category.id, title: row.category.title, slug: row.category.slug }
      : undefined,
    title: row.title,
    slug: row.slug,
    sub: row.sub,
    price: decimalToNumber(row.price),
    oldPrice: decimalToNumber(row.oldPrice),
    availability: row.availability,
    isStock: row.isStock,
    isRestricted: row.isRestricted,
    isTrending: row.isTrending,
    trendingOrder: row.trendingOrder,
    quantity: row.quantity,
    thumbnailWeb: row.thumbnailWeb,
    thumbnailMobile: row.thumbnailMobile,
    bannerWeb: row.bannerWeb,
    description: row.description,
    introduction: row.introduction,
    productUse: row.productUse,
    weight: row.weight,
    vents: row.vents,
    feature: row.feature,
    mips: row.mips,
    material: row.material,
    technology: row.technology,
    certification: row.certification,
    otherDescription: row.otherDescription,
    status: row.status,
    images: (row.images || []).map((img) => ({
      id: img.id,
      url: img.url,
      sortOrder: img.sortOrder,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function productDataFromBody(body) {
  return {
    ...(body.categoryId !== undefined ? { categoryId: Number(body.categoryId) } : {}),
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(body.sub !== undefined ? { sub: body.sub } : {}),
    ...(body.price !== undefined ? { price: body.price } : {}),
    ...(body.oldPrice !== undefined ? { oldPrice: body.oldPrice } : {}),
    ...(body.availability !== undefined ? { availability: body.availability } : {}),
    ...(body.isStock !== undefined ? { isStock: body.isStock } : {}),
    ...(body.isRestricted !== undefined ? { isRestricted: body.isRestricted } : {}),
    ...(body.quantity !== undefined ? { quantity: body.quantity } : {}),
    ...(body.thumbnailWeb !== undefined ? { thumbnailWeb: body.thumbnailWeb } : {}),
    ...(body.thumbnailMobile !== undefined ? { thumbnailMobile: body.thumbnailMobile } : {}),
    ...(body.bannerWeb !== undefined ? { bannerWeb: body.bannerWeb } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.introduction !== undefined ? { introduction: body.introduction } : {}),
    ...(body.productUse !== undefined ? { productUse: body.productUse } : {}),
    ...(body.weight !== undefined ? { weight: body.weight } : {}),
    ...(body.vents !== undefined ? { vents: body.vents } : {}),
    ...(body.feature !== undefined ? { feature: body.feature } : {}),
    ...(body.mips !== undefined ? { mips: body.mips } : {}),
    ...(body.material !== undefined ? { material: body.material } : {}),
    ...(body.technology !== undefined ? { technology: body.technology } : {}),
    ...(body.certification !== undefined ? { certification: body.certification } : {}),
    ...(body.otherDescription !== undefined
      ? { otherDescription: body.otherDescription }
      : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
  };
}

async function listProducts(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};

  if (query.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { slug: { contains: s, mode: "insensitive" } },
      { sub: { contains: s, mode: "insensitive" } },
    ];
  }
  if (query.categoryId) where.categoryId = Number(query.categoryId);
  if (query.status !== undefined && query.status !== "") {
    where.status = query.status === "true" || query.status === true || query.status === "1";
  }

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { id: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    products: rows.map(mapProduct),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getProduct(id) {
  const row = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!row) throw new AppError("Product not found", 404);
  return mapProduct(row);
}

async function createProduct(body) {
  const category = await prisma.category.findUnique({
    where: { id: Number(body.categoryId) },
  });
  if (!category) throw new AppError("Category not found", 404);

  const slug = await uniqueProductSlug(body.slug || body.title);
  const images = Array.isArray(body.images) ? body.images : [];

  const row = await prisma.product.create({
    data: {
      ...productDataFromBody(body),
      title: body.title,
      categoryId: Number(body.categoryId),
      price: body.price,
      slug,
      images: {
        create: images.map((url, index) => ({
          url,
          sortOrder: index + 1,
        })),
      },
    },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
  });

  return mapProduct(row);
}

async function updateProduct(id, body) {
  const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Product not found", 404);

  if (body.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: Number(body.categoryId) },
    });
    if (!category) throw new AppError("Category not found", 404);
  }

  const slug =
    body.slug !== undefined || body.title !== undefined
      ? await uniqueProductSlug(body.slug || body.title || existing.title, existing.id)
      : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: existing.id },
      data: {
        ...productDataFromBody(body),
        ...(slug !== undefined ? { slug } : {}),
      },
    });

    if (Array.isArray(body.images)) {
      await tx.productImage.deleteMany({ where: { productId: existing.id } });
      if (body.images.length) {
        await tx.productImage.createMany({
          data: body.images.map((url, index) => ({
            productId: existing.id,
            url,
            sortOrder: index + 1,
          })),
        });
      }
    }
  });

  return getProduct(existing.id);
}

async function deleteProduct(id) {
  const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Product not found", 404);
  await prisma.product.delete({ where: { id: existing.id } });
  return null;
}

async function updateInventory(id, body) {
  const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Product not found", 404);

  const row = await prisma.product.update({
    where: { id: existing.id },
    data: {
      ...(body.quantity !== undefined ? { quantity: body.quantity } : {}),
      ...(body.availability !== undefined ? { availability: body.availability } : {}),
      ...(body.isStock !== undefined ? { isStock: body.isStock } : {}),
    },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
  });

  return mapProduct(row);
}

async function listTrendingProducts() {
  const rows = await prisma.product.findMany({
    where: { isTrending: true },
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ trendingOrder: "asc" }, { id: "asc" }],
  });
  return rows.map(mapProduct);
}

async function setTrendingProducts(productIds) {
  const ids = (productIds || []).map(Number).filter(Boolean);

  await prisma.$transaction(async (tx) => {
    await tx.product.updateMany({
      where: { isTrending: true },
      data: { isTrending: false, trendingOrder: 0 },
    });

    for (let i = 0; i < ids.length; i += 1) {
      await tx.product.update({
        where: { id: ids[i] },
        data: { isTrending: true, trendingOrder: i + 1 },
      });
    }
  });

  return listTrendingProducts();
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  listTrendingProducts,
  setTrendingProducts,
};
