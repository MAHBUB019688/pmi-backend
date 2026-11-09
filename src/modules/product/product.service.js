const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const { getPagination, buildPagination } = require("../../utils/pagination");
const {
  mapCategory,
  mapProductListItem,
  mapProductDetails,
} = require("../../utils/serializers");

const AVAILABILITY_MAP = {
  in_stock: "in_stock",
  "in-stock": "in_stock",
  instock: "in_stock",
  out_of_stock: "out_of_stock",
  "out-of-stock": "out_of_stock",
  outofstock: "out_of_stock",
  upcoming: "upcoming",
  pre_order: "pre_order",
  "pre-order": "pre_order",
  preorder: "pre_order",
};

function parseAvailability(values) {
  if (!values) return undefined;
  const list = Array.isArray(values) ? values : [values];
  return list
    .map((v) => {
      const key = String(v).trim();
      const normalized = key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
      return (
        AVAILABILITY_MAP[key] ||
        AVAILABILITY_MAP[key.toLowerCase()] ||
        AVAILABILITY_MAP[normalized] ||
        normalized.replace(/-/g, "_")
      );
    })
    .filter(Boolean);
}

async function listCategories({ page, per_page }) {
  const { page: p, perPage, skip, take } = getPagination({
    page,
    per_page,
  });

  const where = { status: true };
  const [total, rows] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      skip,
      take,
    }),
  ]);

  return {
    data: rows.map(mapCategory),
    pagination: buildPagination({ page: p, perPage, total }),
  };
}

async function listProducts(query, { restrictedOnly = false } = {}) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {
    status: true,
    isRestricted: restrictedOnly,
  };

  if (query.category_id) {
    where.categoryId = Number(query.category_id);
  }

  if (query.search?.trim()) {
    where.OR = [
      { title: { contains: query.search.trim(), mode: "insensitive" } },
      { sub: { contains: query.search.trim(), mode: "insensitive" } },
      { description: { contains: query.search.trim(), mode: "insensitive" } },
    ];
  }

  if (query.min_price !== undefined) {
    where.price = { ...(where.price || {}), gte: Number(query.min_price) };
  }
  if (query.max_price !== undefined) {
    where.price = { ...(where.price || {}), lte: Number(query.max_price) };
  }

  const availability = parseAvailability(query.availability);
  if (availability?.length) {
    where.availability = { in: availability };
  }

  const sortBy = query.sort_by || "created_at";
  const sortDir = query.sort_dir === "asc" ? "asc" : "desc";
  const orderBy =
    sortBy === "price"
      ? { price: sortDir }
      : sortBy === "title"
        ? { title: sortDir }
        : { createdAt: sortDir };

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    data: rows.map(mapProductListItem),
    pagination: buildPagination({ page, perPage, total }),
  };
}

async function searchProducts(query) {
  const search = query.search?.trim();
  if (!search) {
    return { products: [], events: [] };
  }

  const [products, events] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: true,
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      },
      include: { category: true },
      take: 20,
      orderBy: { title: "asc" },
    }),
    prisma.event.findMany({
      where: {
        status: true,
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      },
      include: { eventCategory: true },
      take: 10,
      orderBy: { date: "desc" },
    }),
  ]);

  return {
    products: products.map(mapProductListItem),
    events: events.map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      date: event.date?.toISOString?.().slice(0, 10) || event.date,
      banner: {
        web_url: event.bannerWeb,
        mobile_url: event.bannerMobile,
      },
    })),
  };
}

async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product || !product.status) {
    throw new AppError("Product not found", 404);
  }

  const related = await prisma.product.findMany({
    where: {
      status: true,
      categoryId: product.categoryId,
      id: { not: product.id },
      isRestricted: product.isRestricted,
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
    take: 8,
  });

  return mapProductDetails({ ...product, related });
}

async function getPageContent(key) {
  const page = await prisma.pageContent.findUnique({ where: { key } });
  if (!page) {
    return { data: null };
  }
  return { data: page.data };
}

async function listProductSlugs() {
  const rows = await prisma.product.findMany({
    where: { status: true },
    select: { slug: true },
    orderBy: { id: "asc" },
  });
  return rows.map((row) => row.slug);
}

module.exports = {
  listCategories,
  listProducts,
  searchProducts,
  getProductBySlug,
  getPageContent,
  listProductSlugs,
};
