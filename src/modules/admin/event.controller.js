const { z } = require("zod");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const eventService = require("./event.service");

const eventCategorySchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional().nullable(),
  status: z.boolean().optional(),
});

const ticketSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.coerce.number(),
  quantity: z.coerce.number().int().optional(),
  imageUrl: z.string().optional().nullable(),
  status: z.boolean().optional(),
});

const eventSchema = z.object({
  eventCategoryId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  location: z.string().min(1),
  bannerWeb: z.string().optional().nullable(),
  bannerMobile: z.string().optional().nullable(),
  mediaUrl: z.string().optional().nullable(),
  stages: z.any().optional().nullable(),
  status: z.boolean().optional(),
  isUpcoming: z.boolean().optional(),
  tickets: z.array(ticketSchema).optional(),
});

const gallerySchema = z.object({
  eventCategoryId: z.coerce.number().int().positive(),
  image: z.string().min(1),
  sortOrder: z.coerce.number().int().optional(),
});

// Event categories
const listEventCategories = asyncHandler(async (req, res) => {
  const data = await eventService.listEventCategories(req.query);
  return success(res, { message: "Event categories fetched", data });
});
const getEventCategory = asyncHandler(async (req, res) => {
  const data = await eventService.getEventCategory(req.params.id);
  return success(res, { message: "Event category fetched", data });
});
const createEventCategory = asyncHandler(async (req, res) => {
  const body = validate(eventCategorySchema, req.body);
  const data = await eventService.createEventCategory(body);
  return success(res, { statusCode: 201, message: "Event category created", data });
});
const updateEventCategory = asyncHandler(async (req, res) => {
  const body = validate(eventCategorySchema.partial(), req.body);
  const data = await eventService.updateEventCategory(req.params.id, body);
  return success(res, { message: "Event category updated", data });
});
const deleteEventCategory = asyncHandler(async (req, res) => {
  await eventService.deleteEventCategory(req.params.id);
  return success(res, { message: "Event category deleted", data: null });
});

// Events
const listEvents = asyncHandler(async (req, res) => {
  const data = await eventService.listEvents(req.query);
  return success(res, { message: "Events fetched", data });
});
const getEvent = asyncHandler(async (req, res) => {
  const data = await eventService.getEvent(req.params.id);
  return success(res, { message: "Event fetched", data });
});
const createEvent = asyncHandler(async (req, res) => {
  const body = validate(eventSchema, req.body);
  const data = await eventService.createEvent(body);
  return success(res, { statusCode: 201, message: "Event created", data });
});
const updateEvent = asyncHandler(async (req, res) => {
  const body = validate(eventSchema.partial(), req.body);
  const data = await eventService.updateEvent(req.params.id, body);
  return success(res, { message: "Event updated", data });
});
const deleteEvent = asyncHandler(async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  return success(res, { message: "Event deleted", data: null });
});

// Galleries
const listGalleries = asyncHandler(async (req, res) => {
  const data = await eventService.listGalleries(req.query);
  return success(res, { message: "Galleries fetched", data });
});
const getGallery = asyncHandler(async (req, res) => {
  const data = await eventService.getGallery(req.params.id);
  return success(res, { message: "Gallery fetched", data });
});
const createGallery = asyncHandler(async (req, res) => {
  const body = validate(gallerySchema, req.body);
  const data = await eventService.createGallery(body);
  return success(res, { statusCode: 201, message: "Gallery created", data });
});
const updateGallery = asyncHandler(async (req, res) => {
  const body = validate(gallerySchema.partial(), req.body);
  const data = await eventService.updateGallery(req.params.id, body);
  return success(res, { message: "Gallery updated", data });
});
const deleteGallery = asyncHandler(async (req, res) => {
  await eventService.deleteGallery(req.params.id);
  return success(res, { message: "Gallery deleted", data: null });
});

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
