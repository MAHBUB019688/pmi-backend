const prisma = require("../../db/prisma");
const AppError = require("../../utils/AppError");
const { mapEventListItem, mapEventDetails } = require("../../utils/serializers");

async function getUpcomingEvents() {
  const events = await prisma.event.findMany({
    where: { status: true, isUpcoming: true },
    include: { eventCategory: true },
    orderBy: { date: "asc" },
  });

  return { events: events.map(mapEventListItem) };
}

async function getEventBySlug(slug) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      eventCategory: true,
      tickets: { where: { status: true }, orderBy: { price: "asc" } },
    },
  });

  if (!event || !event.status) {
    throw new AppError("Event not found", 404);
  }

  const details = mapEventDetails(event);

  // Match frontend nested shape: data.event.*
  return {
    event: {
      ...details,
      date: details.date,
      start_time: event.startTime,
      end_time: event.endTime,
      location: event.location,
      title: event.title,
      description: event.description,
      headliners_title: "Headliners",
      headliners_description: null,
      headliners: [],
      lineup_title: "Lineup",
      lineup_description: null,
      tickets_section_title: "Tickets",
      products_section_title: "Event Merch",
      products: [],
      tickets: details.tickets,
      stages: details.stages,
      thumbnail: {
        web_url: event.bannerWeb,
        mobile_url: event.bannerMobile,
      },
      hero_banner: {
        media: event.mediaUrl || event.bannerWeb,
        url: event.mediaUrl,
      },
      meta: {
        title: event.title,
        description: event.description,
      },
    },
  };
}

async function getHomePage() {
  const page = await prisma.pageContent.findUnique({ where: { key: "home" } });
  return page?.data || { home: null };
}

async function listEventSlugs() {
  const rows = await prisma.event.findMany({
    where: { status: true },
    select: { slug: true },
    orderBy: { id: "asc" },
  });
  return rows.map((row) => row.slug);
}

module.exports = {
  getUpcomingEvents,
  getEventBySlug,
  getHomePage,
  listEventSlugs,
};
