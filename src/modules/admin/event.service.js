const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const slugify = require("../../utils/slugify");
const { getPagination, buildPagination } = require("../../utils/pagination");
const { decimalToNumber } = require("../../utils/serializers");

async function uniqueEventCategorySlug(base, excludeId) {
  let slug = slugify(base) || "event-category";
  let candidate = slug;
  let i = 1;
  while (true) {
    const existing = await prisma.eventCategory.findUnique({ where: { slug: candidate } });
    if (!existing || (excludeId && existing.id === excludeId)) return candidate;
    candidate = `${slug}-${i++}`;
  }
}

async function uniqueEventSlug(base, excludeId) {
  let slug = slugify(base) || "event";
  let candidate = slug;
  let i = 1;
  while (true) {
    const existing = await prisma.event.findUnique({ where: { slug: candidate } });
    if (!existing || (excludeId && existing.id === excludeId)) return candidate;
    candidate = `${slug}-${i++}`;
  }
}

function mapEventCategory(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapTicket(t) {
  return {
    id: t.id,
    eventId: t.eventId,
    title: t.title,
    description: t.description,
    price: decimalToNumber(t.price),
    quantity: t.quantity,
    imageUrl: t.imageUrl,
    status: t.status,
  };
}

function mapEvent(row) {
  return {
    id: row.id,
    eventCategoryId: row.eventCategoryId,
    eventCategory: row.eventCategory
      ? mapEventCategory(row.eventCategory)
      : undefined,
    title: row.title,
    slug: row.slug,
    description: row.description,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    location: row.location,
    bannerWeb: row.bannerWeb,
    bannerMobile: row.bannerMobile,
    mediaUrl: row.mediaUrl,
    stages: row.stages,
    status: row.status,
    isUpcoming: row.isUpcoming,
    tickets: (row.tickets || []).map(mapTicket),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapGallery(row) {
  return {
    id: row.id,
    eventCategoryId: row.eventCategoryId,
    image: row.image,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    eventCategory: row.eventCategory
      ? mapEventCategory(row.eventCategory)
      : undefined,
  };
}

// ── Event categories ──────────────────────────────────────────────────────
async function listEventCategories(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.search?.trim()) {
    where.title = { contains: query.search.trim(), mode: "insensitive" };
  }
  const [total, rows] = await Promise.all([
    prisma.eventCategory.count({ where }),
    prisma.eventCategory.findMany({
      where,
      orderBy: { id: "desc" },
      skip,
      take,
    }),
  ]);
  return {
    eventCategories: rows.map(mapEventCategory),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getEventCategory(id) {
  const row = await prisma.eventCategory.findUnique({ where: { id: Number(id) } });
  if (!row) throw new AppError("Event category not found", 404);
  return mapEventCategory(row);
}

async function createEventCategory(body) {
  const slug = await uniqueEventCategorySlug(body.slug || body.title);
  const row = await prisma.eventCategory.create({
    data: {
      title: body.title,
      slug,
      status: body.status ?? true,
    },
  });
  return mapEventCategory(row);
}

async function updateEventCategory(id, body) {
  const existing = await prisma.eventCategory.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Event category not found", 404);
  const slug =
    body.slug !== undefined || body.title !== undefined
      ? await uniqueEventCategorySlug(
          body.slug || body.title || existing.title,
          existing.id,
        )
      : undefined;
  const row = await prisma.eventCategory.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    },
  });
  return mapEventCategory(row);
}

async function deleteEventCategory(id) {
  const existing = await prisma.eventCategory.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Event category not found", 404);
  await prisma.eventCategory.delete({ where: { id: existing.id } });
  return null;
}

// ── Events ────────────────────────────────────────────────────────────────
async function listEvents(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.search?.trim()) {
    const s = query.search.trim();
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { slug: { contains: s, mode: "insensitive" } },
    ];
  }
  if (query.eventCategoryId) where.eventCategoryId = Number(query.eventCategoryId);

  const [total, rows] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      include: {
        eventCategory: true,
        tickets: { orderBy: { id: "asc" } },
      },
      orderBy: { date: "desc" },
      skip,
      take,
    }),
  ]);

  return {
    events: rows.map(mapEvent),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getEvent(id) {
  const row = await prisma.event.findUnique({
    where: { id: Number(id) },
    include: {
      eventCategory: true,
      tickets: { orderBy: { id: "asc" } },
    },
  });
  if (!row) throw new AppError("Event not found", 404);
  return mapEvent(row);
}

async function createEvent(body) {
  const category = await prisma.eventCategory.findUnique({
    where: { id: Number(body.eventCategoryId) },
  });
  if (!category) throw new AppError("Event category not found", 404);

  const slug = await uniqueEventSlug(body.slug || body.title);
  const tickets = Array.isArray(body.tickets) ? body.tickets : [];

  const row = await prisma.event.create({
    data: {
      eventCategoryId: Number(body.eventCategoryId),
      title: body.title,
      slug,
      description: body.description ?? null,
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      location: body.location,
      bannerWeb: body.bannerWeb ?? null,
      bannerMobile: body.bannerMobile ?? null,
      mediaUrl: body.mediaUrl ?? null,
      stages: body.stages ?? null,
      status: body.status ?? true,
      isUpcoming: body.isUpcoming ?? true,
      tickets: {
        create: tickets.map((t) => ({
          title: t.title,
          description: t.description ?? null,
          price: t.price,
          quantity: t.quantity ?? 0,
          imageUrl: t.imageUrl ?? null,
          status: t.status ?? true,
        })),
      },
    },
    include: {
      eventCategory: true,
      tickets: { orderBy: { id: "asc" } },
    },
  });

  return mapEvent(row);
}

async function updateEvent(id, body) {
  const existing = await prisma.event.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Event not found", 404);

  if (body.eventCategoryId) {
    const category = await prisma.eventCategory.findUnique({
      where: { id: Number(body.eventCategoryId) },
    });
    if (!category) throw new AppError("Event category not found", 404);
  }

  const slug =
    body.slug !== undefined || body.title !== undefined
      ? await uniqueEventSlug(body.slug || body.title || existing.title, existing.id)
      : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.event.update({
      where: { id: existing.id },
      data: {
        ...(body.eventCategoryId !== undefined
          ? { eventCategoryId: Number(body.eventCategoryId) }
          : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.date !== undefined ? { date: new Date(body.date) } : {}),
        ...(body.startTime !== undefined ? { startTime: body.startTime } : {}),
        ...(body.endTime !== undefined ? { endTime: body.endTime } : {}),
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(body.bannerWeb !== undefined ? { bannerWeb: body.bannerWeb } : {}),
        ...(body.bannerMobile !== undefined ? { bannerMobile: body.bannerMobile } : {}),
        ...(body.mediaUrl !== undefined ? { mediaUrl: body.mediaUrl } : {}),
        ...(body.stages !== undefined ? { stages: body.stages } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.isUpcoming !== undefined ? { isUpcoming: body.isUpcoming } : {}),
      },
    });

    if (Array.isArray(body.tickets)) {
      await tx.ticket.deleteMany({ where: { eventId: existing.id } });
      if (body.tickets.length) {
        await tx.ticket.createMany({
          data: body.tickets.map((t) => ({
            eventId: existing.id,
            title: t.title,
            description: t.description ?? null,
            price: t.price,
            quantity: t.quantity ?? 0,
            imageUrl: t.imageUrl ?? null,
            status: t.status ?? true,
          })),
        });
      }
    }
  });

  return getEvent(existing.id);
}

async function deleteEvent(id) {
  const existing = await prisma.event.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Event not found", 404);
  await prisma.event.delete({ where: { id: existing.id } });
  return null;
}

// ── Galleries ─────────────────────────────────────────────────────────────
async function listGalleries(query) {
  const { page, perPage, skip, take } = getPagination(query);
  const where = {};
  if (query.eventCategoryId) where.eventCategoryId = Number(query.eventCategoryId);

  const [total, rows] = await Promise.all([
    prisma.gallery.count({ where }),
    prisma.gallery.findMany({
      where,
      include: { eventCategory: true },
      orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      skip,
      take,
    }),
  ]);

  return {
    galleries: rows.map(mapGallery),
    meta: buildPagination({ page, perPage, total }),
  };
}

async function getGallery(id) {
  const row = await prisma.gallery.findUnique({
    where: { id: Number(id) },
    include: { eventCategory: true },
  });
  if (!row) throw new AppError("Gallery item not found", 404);
  return mapGallery(row);
}

async function createGallery(body) {
  const category = await prisma.eventCategory.findUnique({
    where: { id: Number(body.eventCategoryId) },
  });
  if (!category) throw new AppError("Event category not found", 404);

  const row = await prisma.gallery.create({
    data: {
      eventCategoryId: Number(body.eventCategoryId),
      image: body.image,
      sortOrder: body.sortOrder ?? 0,
    },
    include: { eventCategory: true },
  });
  return mapGallery(row);
}

async function updateGallery(id, body) {
  const existing = await prisma.gallery.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Gallery item not found", 404);

  if (body.eventCategoryId) {
    const category = await prisma.eventCategory.findUnique({
      where: { id: Number(body.eventCategoryId) },
    });
    if (!category) throw new AppError("Event category not found", 404);
  }

  const row = await prisma.gallery.update({
    where: { id: existing.id },
    data: {
      ...(body.eventCategoryId !== undefined
        ? { eventCategoryId: Number(body.eventCategoryId) }
        : {}),
      ...(body.image !== undefined ? { image: body.image } : {}),
      ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
    },
    include: { eventCategory: true },
  });
  return mapGallery(row);
}

async function deleteGallery(id) {
  const existing = await prisma.gallery.findUnique({ where: { id: Number(id) } });
  if (!existing) throw new AppError("Gallery item not found", 404);
  await prisma.gallery.delete({ where: { id: existing.id } });
  return null;
}

module.exports = {
  listEventCategories,
  getEventCategory,
  createEventCategory,
  updateEventCategory,
  deleteEventCategory,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  listGalleries,
  getGallery,
  createGallery,
  updateGallery,
  deleteGallery,
};
