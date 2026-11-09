const cartService = require("./cart.service");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const { z } = require("zod");

const addSchema = z.object({
  item_id: z.coerce.number().int().positive(),
  item_type: z.enum(["product", "ticket"]),
  quantity: z.coerce.number().int().positive().optional(),
});

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
});

const getCart = asyncHandler(async (req, res) => {
  const data = await cartService.getCartWithItems(req.user.id);
  return success(res, { message: "Cart fetched", data });
});

const addToCart = asyncHandler(async (req, res) => {
  const body = validate(addSchema, req.body);
  const data = await cartService.addToCart(req.user.id, body);
  return success(res, { message: "Added to cart", data });
});

const updateCart = asyncHandler(async (req, res) => {
  const body = validate(updateSchema, req.body);
  const data = await cartService.updateCart(req.user.id, body);
  return success(res, { message: "Cart updated", data });
});

const removeCart = asyncHandler(async (req, res) => {
  const data = await cartService.removeCartItem(req.user.id, req.params.id);
  return success(res, { message: "Item removed", data });
});

module.exports = { getCart, addToCart, updateCart, removeCart };
