const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const slugify = require("../../utils/slugify");
const { getPagination, buildPagination } = require("../../utils/pagination");

async function uniqueCategorySlug(base, excludeId) {
  let slug = slugify(base) || "category";
  let candidate = slug;
  let i = 1;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug: candidate } });
    if (!existing || (excludeId && existing.id === excludeId)) return candidate;
    candidate = `${slug}-${i++}`;
  }
}

function mapCategory(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    image: row.image,
    sortOrder: row.sortOrder,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function listCategories(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};

  if (query.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { slug: { contains: s, mode: "insensitive" } },
    ];
  }

  if (query.status !== undefined && query.status !== "") {
    where.status = query.status === "true" || query.status === true || query.status === "1";
  }

  const [total, rows] = await Promise.all([
    prisma.category.count({ where }),
    prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      skip,
      take,
    }),
  ]);

  return {
    categories: rows.map(mapCategory),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getCategory(id) {
  const row = await prisma.category.findUnique({ where: { id: Number(id) } });
  if (!row) throw new AppError("Category not found", 404);
  return mapCategory(row);
}

async function createCategory(body) {
  const slug = await uniqueCategorySlug(body.slug || body.title);
  const row = await prisma.category.create({
    data: {
      title: body.title,
      slug,
      image: body.image ?? null,
      sortOrder: body.sortOrder ?? 0,
      status: body.status ?? true,
    },
  });
  return mapCategory(row);
}

async function updateCategory(id, body) {
  const existing = await prisma.category.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Category not found", 404);

  const slug =
    body.slug !== undefined || body.title !== undefined
      ? await uniqueCategorySlug(body.slug || body.title || existing.title, existing.id)
      : undefined;

  const row = await prisma.category.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(body.image !== undefined ? { image: body.image } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  });
  return mapCategory(row);
}

async function deleteCategory(id) {
  const existing = await prisma.category.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Category not found", 404);

  const productCount = await prisma.product.count({ where: { categoryId: existing.id } });
  if (productCount > 0) {
    throw new AppError("Cannot delete category with products", 400);
  }

  await prisma.category.delete({ where: { id: existing.id } });
  return null;
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
