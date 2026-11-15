const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const { getPagination, buildPagination } = require("../../utils/pagination");

// ── Page contents ─────────────────────────────────────────────────────────
async function getPageContent(key) {
  const page = await prisma.pageContent.findUnique({ where: { key } });
  if (!page) {
    return {
      id: null,
      key,
      title: null,
      subtitle: null,
      data: {},
      createdAt: null,
      updatedAt: null,
    };
  }
  return {
    id: page.id,
    key: page.key,
    title: page.title,
    subtitle: page.subtitle,
    data: page.data,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
}

async function upsertPageContent(key, body) {
  const page = await prisma.pageContent.upsert({
    where: { key },
    update: {
      title: body.title ?? null,
      subtitle: body.subtitle ?? null,
      data: body.data ?? {},
    },
    create: {
      key,
      title: body.title ?? null,
      subtitle: body.subtitle ?? null,
      data: body.data ?? {},
    },
  });
  return {
    id: page.id,
    key: page.key,
    title: page.title,
    subtitle: page.subtitle,
    data: page.data,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
  };
}

// ── Term categories / terms ───────────────────────────────────────────────
async function listTermCategories(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const [total, rows] = await Promise.all([
    prisma.termCategory.count(),
    prisma.termCategory.findMany({
      include: { terms: true },
      orderBy: { sortOrder: "asc" },
      skip,
      take,
    }),
  ]);
  return {
    termCategories: rows,
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getTermCategory(id) {
  const row = await prisma.termCategory.findUnique({
    where: { id: Number(id) },
    include: { terms: true },
  });
  if (!row) throw new AppError("Term category not found", 404);
  return row;
}

async function createTermCategory(body) {
  return prisma.termCategory.create({
    data: {
      title: body.title,
      subtitle: body.subtitle ?? null,
      iconImage: body.iconImage ?? null,
      iconImageUrl: body.iconImageUrl ?? null,
      status: body.status ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });
}

async function updateTermCategory(id, body) {
  const existing = await prisma.termCategory.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Term category not found", 404);
  return prisma.termCategory.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
      ...(body.iconImage !== undefined ? { iconImage: body.iconImage } : {}),
      ...(body.iconImageUrl !== undefined ? { iconImageUrl: body.iconImageUrl } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    },
  });
}

async function deleteTermCategory(id) {
  const existing = await prisma.termCategory.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Term category not found", 404);
  await prisma.termCategory.delete({ where: { id: existing.id } });
  return null;
}

async function listTerms(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.termCategoryId) where.termCategoryId = Number(query.termCategoryId);
  const [total, rows] = await Promise.all([
    prisma.term.count({ where }),
    prisma.term.findMany({
      where,
      include: { category: true },
      orderBy: { id: "asc" },
      skip,
      take,
    }),
  ]);
  return { terms: rows, meta: buildPagination({ page, perPage, total }) };
}

async function getTerm(id) {
  const row = await prisma.term.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  });
  if (!row) throw new AppError("Term not found", 404);
  return row;
}

async function createTerm(body) {
  return prisma.term.create({
    data: {
      termCategoryId: Number(body.termCategoryId),
      title: body.title,
      acknowledgment: body.acknowledgment ?? null,
      description: body.description,
    },
    include: { category: true },
  });
}

async function updateTerm(id, body) {
  const existing = await prisma.term.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Term not found", 404);
  return prisma.term.update({
    where: { id: existing.id },
    data: {
      ...(body.termCategoryId !== undefined
        ? { termCategoryId: Number(body.termCategoryId) }
        : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.acknowledgment !== undefined
        ? { acknowledgment: body.acknowledgment }
        : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    },
    include: { category: true },
  });
}

async function deleteTerm(id) {
  const existing = await prisma.term.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Term not found", 404);
  await prisma.term.delete({ where: { id: existing.id } });
  return null;
}

// ── Compliance categories / compliances ───────────────────────────────────
async function listComplianceCategories(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const [total, rows] = await Promise.all([
    prisma.complianceCategory.count(),
    prisma.complianceCategory.findMany({
      include: { compliances: true },
      orderBy: { sortOrder: "asc" },
      skip,
      take,
    }),
  ]);
  return {
    complianceCategories: rows,
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getComplianceCategory(id) {
  const row = await prisma.complianceCategory.findUnique({
    where: { id: Number(id) },
    include: { compliances: true },
  });
  if (!row) throw new AppError("Compliance category not found", 404);
  return row;
}

async function createComplianceCategory(body) {
  return prisma.complianceCategory.create({
    data: {
      title: body.title,
      subtitle: body.subtitle ?? null,
      iconImage: body.iconImage ?? null,
      iconImageUrl: body.iconImageUrl ?? null,
      status: body.status ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  });
}

async function updateComplianceCategory(id, body) {
  const existing = await prisma.complianceCategory.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Compliance category not found", 404);
  return prisma.complianceCategory.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
      ...(body.iconImage !== undefined ? { iconImage: body.iconImage } : {}),
      ...(body.iconImageUrl !== undefined ? { iconImageUrl: body.iconImageUrl } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    },
  });
}

async function deleteComplianceCategory(id) {
  const existing = await prisma.complianceCategory.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Compliance category not found", 404);
  await prisma.complianceCategory.delete({ where: { id: existing.id } });
  return null;
}

async function listCompliances(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.complianceCategoryId) {
    where.complianceCategoryId = Number(query.complianceCategoryId);
  }
  const [total, rows] = await Promise.all([
    prisma.compliance.count({ where }),
    prisma.compliance.findMany({
      where,
      include: { category: true },
      orderBy: { id: "asc" },
      skip,
      take,
    }),
  ]);
  return { compliances: rows, meta: buildPagination({ page, perPage, total }) };
}

async function getCompliance(id) {
  const row = await prisma.compliance.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  });
  if (!row) throw new AppError("Compliance not found", 404);
  return row;
}

async function createCompliance(body) {
  return prisma.compliance.create({
    data: {
      complianceCategoryId: Number(body.complianceCategoryId),
      title: body.title,
      subtitle: body.subtitle ?? null,
      acknowledgment: body.acknowledgment ?? null,
      descriptionTitle: body.descriptionTitle ?? null,
      description: body.description,
    },
    include: { category: true },
  });
}

async function updateCompliance(id, body) {
  const existing = await prisma.compliance.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Compliance not found", 404);
  return prisma.compliance.update({
    where: { id: existing.id },
    data: {
      ...(body.complianceCategoryId !== undefined
        ? { complianceCategoryId: Number(body.complianceCategoryId) }
        : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
      ...(body.acknowledgment !== undefined
        ? { acknowledgment: body.acknowledgment }
        : {}),
      ...(body.descriptionTitle !== undefined
        ? { descriptionTitle: body.descriptionTitle }
        : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    },
    include: { category: true },
  });
}

async function deleteCompliance(id) {
  const existing = await prisma.compliance.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Compliance not found", 404);
  await prisma.compliance.delete({ where: { id: existing.id } });
  return null;
}

// ── Compliance contacts / meta ────────────────────────────────────────────
async function listComplianceContacts() {
  return prisma.complianceContact.findMany({ orderBy: { id: "asc" } });
}

async function getComplianceContact(id) {
  const row = await prisma.complianceContact.findUnique({
    where: { id: Number(id) },
  });
  if (!row) throw new AppError("Compliance contact not found", 404);
  return row;
}

async function createComplianceContact(body) {
  return prisma.complianceContact.create({
    data: {
      title: body.title,
      subtitle: body.subtitle ?? null,
      email: body.email,
      phone: body.phone,
    },
  });
}

async function updateComplianceContact(id, body) {
  const existing = await prisma.complianceContact.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Compliance contact not found", 404);
  return prisma.complianceContact.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
    },
  });
}

async function deleteComplianceContact(id) {
  const existing = await prisma.complianceContact.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) throw new AppError("Compliance contact not found", 404);
  await prisma.complianceContact.delete({ where: { id: existing.id } });
  return null;
}

async function getComplianceMeta() {
  let meta = await prisma.complianceMeta.findUnique({ where: { id: 1 } });
  if (!meta) {
    meta = await prisma.complianceMeta.create({
      data: { id: 1, mainSubtitleDescription: "Compliance & Legal" },
    });
  }
  return meta;
}

async function updateComplianceMeta(body) {
  return prisma.complianceMeta.upsert({
    where: { id: 1 },
    update: {
      mainSubtitleDescription: body.mainSubtitleDescription,
    },
    create: {
      id: 1,
      mainSubtitleDescription: body.mainSubtitleDescription || "Compliance & Legal",
    },
  });
}

module.exports = {
  getPageContent,
  upsertPageContent,
  listTermCategories,
  getTermCategory,
  createTermCategory,
  updateTermCategory,
  deleteTermCategory,
  listTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
  listComplianceCategories,
  getComplianceCategory,
  createComplianceCategory,
  updateComplianceCategory,
  deleteComplianceCategory,
  listCompliances,
  getCompliance,
  createCompliance,
  updateCompliance,
  deleteCompliance,
  listComplianceContacts,
  getComplianceContact,
  createComplianceContact,
  updateComplianceContact,
  deleteComplianceContact,
  getComplianceMeta,
  updateComplianceMeta,
};
