const prisma = require("../../db/prisma");
const { getPagination, buildPagination } = require("../../utils/pagination");

async function getStores(search) {
  const where = { status: true };
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { address: { contains: search.trim(), mode: "insensitive" } },
      { description: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const stores = await prisma.store.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return {
    stores: stores.map((store) => ({
      id: store.id,
      name: store.name,
      address: store.address,
      description: store.description,
      latitude: Number(store.latitude),
      longitude: Number(store.longitude),
      status: store.status,
    })),
  };
}

async function getTerms() {
  const categories = await prisma.termCategory.findMany({
    where: { status: true },
    include: { terms: true },
    orderBy: { sortOrder: "asc" },
  });

  return {
    meta: null,
    categories: categories.map((cat) => ({
      id: cat.id,
      title: cat.title,
      subtitle: cat.subtitle,
      icon_image: cat.iconImage,
      icon_image_url: cat.iconImageUrl,
      status: cat.status,
      terms: cat.terms.map((term) => ({
        id: term.id,
        term_id: term.id,
        term_category_id: cat.id,
        term_category_name: cat.title,
        acknowledgment: term.acknowledgment,
        title: term.title,
        description: term.description,
      })),
    })),
  };
}

async function getCompliance() {
  const [categories, contacts, meta] = await Promise.all([
    prisma.complianceCategory.findMany({
      where: { status: true },
      include: { compliances: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.complianceContact.findMany({ orderBy: { id: "asc" } }),
    prisma.complianceMeta.findUnique({ where: { id: 1 } }),
  ]);

  return {
    meta: null,
    main_subtitle_description:
      meta?.mainSubtitleDescription || "Compliance & Legal",
    contacts,
    categories: categories.map((cat) => ({
      id: cat.id,
      title: cat.title,
      subtitle: cat.subtitle,
      icon_image: cat.iconImage,
      icon_image_url: cat.iconImageUrl,
      status: cat.status,
      compliances: cat.compliances.map((item) => ({
        id: item.id,
        compliance_id: item.id,
        compliance_category_id: cat.id,
        compliance_category_name: cat.title,
        acknowledgment: item.acknowledgment,
        title: item.title,
        subtitle: item.subtitle,
        description_title: item.descriptionTitle,
        description: item.description,
      })),
    })),
  };
}

async function getGalleries(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};

  if (query.event_category_slug && query.event_category_slug !== "all") {
    where.eventCategory = { slug: query.event_category_slug };
  }

  const [total, rows, eventCategories, pageMeta] = await Promise.all([
    prisma.gallery.count({ where }),
    prisma.gallery.findMany({
      where,
      include: { eventCategory: true },
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      skip,
      take,
    }),
    prisma.eventCategory.findMany({
      where: { status: true },
      orderBy: { title: "asc" },
    }),
    prisma.pageContent.findUnique({ where: { key: "galleries-page" } }),
  ]);

  return {
    gallery_page: pageMeta?.data?.gallery_page || {
      title: "Gallery",
      description: "Event moments",
      meta_title: "Gallery",
      meta_description: null,
      meta_keywords: null,
    },
    event_categories: eventCategories.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
    })),
    galleries: rows.map((g) => ({
      id: g.id,
      event_category_id: g.eventCategoryId,
      event_category_title: g.eventCategory.title,
      event_category_slug: g.eventCategory.slug,
      sort_order: g.sortOrder,
      image: g.image,
    })),
    pagination: buildPagination({ page, perPage, total }),
  };
}

async function getGalleryPageMeta() {
  const page = await prisma.pageContent.findUnique({
    where: { key: "galleries-page" },
  });
  return page?.data || null;
}

module.exports = {
  getStores,
  getTerms,
  getCompliance,
  getGalleries,
  getGalleryPageMeta,
};
