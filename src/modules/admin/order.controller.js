const { z } = require("zod");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const orderService = require("./order.service");

const statusSchema = z.object({
  status: z.enum(["pending", "paid", "cancelled", "completed"]),
});

const list = asyncHandler(async (req, res) => {
  const data = await orderService.listOrders(req.query);
  return success(res, { message: "Orders fetched", data });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await orderService.getOrder(req.params.id);
  return success(res, { message: "Order fetched", data });
});

const updateStatus = asyncHandler(async (req, res) => {
  const body = validate(statusSchema, req.body);
  const data = await orderService.updateOrderStatus(req.params.id, body.status);
  return success(res, { message: "Order status updated", data });
});

module.exports = { list, getOne, updateStatus };
