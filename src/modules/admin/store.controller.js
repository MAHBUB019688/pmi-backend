const { z } = require("zod");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const storeService = require("./store.service");

const storeSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  description: z.string().optional().nullable(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  status: z.boolean().optional(),
});

const list = asyncHandler(async (req, res) => {
  const data = await storeService.listStores(req.query);
  return success(res, { message: "Stores fetched", data });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await storeService.getStore(req.params.id);
  return success(res, { message: "Store fetched", data });
});

const create = asyncHandler(async (req, res) => {
  const body = validate(storeSchema, req.body);
  const data = await storeService.createStore(body);
  return success(res, { statusCode: 201, message: "Store created", data });
});

const update = asyncHandler(async (req, res) => {
  const body = validate(storeSchema.partial(), req.body);
  const data = await storeService.updateStore(req.params.id, body);
  return success(res, { message: "Store updated", data });
});

const remove = asyncHandler(async (req, res) => {
  await storeService.deleteStore(req.params.id);
  return success(res, { message: "Store deleted", data: null });
});

module.exports = { list, getOne, create, update, remove };
