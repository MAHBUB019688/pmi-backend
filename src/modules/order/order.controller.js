const orderService = require("./order.service");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const { z } = require("zod");

const addressSchema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(8).optional(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  country: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  additional_info: z.string().optional(),
  town: z.string().optional(),
  city: z.string().min(1, "City is required"),
  post_code: z.string().optional(),
  user_id: z.coerce.number().optional(),
  remember: z.boolean().optional(),
});

const purchaseSchema = z.object({
  item_ids: z.array(z.coerce.number().int().positive()).min(1),
  payment_method: z.enum(["cash", "card", "online"]).optional(),
});

const saveAddress = asyncHandler(async (req, res) => {
  const body = validate(addressSchema, req.body);
  const data = await orderService.upsertAddress(req.user.id, body);
  return success(res, { message: "Address saved", data });
});

const getAddress = asyncHandler(async (req, res) => {
  const data = await orderService.getAddressByUserId(
    req.user.id,
    req.params.id,
  );
  return success(res, { message: "Address fetched", data });
});

const purchaseProduct = asyncHandler(async (req, res) => {
  const body = validate(purchaseSchema, req.body);
  const data = await orderService.purchaseProducts(req.user.id, body);
  return success(res, { message: "Order placed successfully", data });
});

const purchaseTicket = asyncHandler(async (req, res) => {
  const body = validate(purchaseSchema, req.body);
  const data = await orderService.purchaseTickets(req.user.id, body);
  return success(res, { message: "Ticket purchased successfully", data });
});

const latestOrder = asyncHandler(async (req, res) => {
  const data = await orderService.getLatestOrder(req.user.id);
  return success(res, { message: "Latest order", data });
});

module.exports = {
  saveAddress,
  getAddress,
  purchaseProduct,
  purchaseTicket,
  latestOrder,
};
