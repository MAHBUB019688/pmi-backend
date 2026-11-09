const eventService = require("./event.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const getUpcoming = asyncHandler(async (_req, res) => {
  const data = await eventService.getUpcomingEvents();
  return success(res, { message: "Upcoming events", data });
});

const getDetails = asyncHandler(async (req, res) => {
  const data = await eventService.getEventBySlug(req.params.slug);
  return success(res, { message: "Event details", data });
});

const getHome = asyncHandler(async (_req, res) => {
  const data = await eventService.getHomePage();
  return success(res, { message: "Home page", data });
});

// Sitemap expects a raw string[] (not the usual success envelope).
const getEventSlugs = asyncHandler(async (_req, res) => {
  const slugs = await eventService.listEventSlugs();
  return res.status(200).json(slugs);
});

module.exports = { getUpcoming, getDetails, getHome, getEventSlugs };
