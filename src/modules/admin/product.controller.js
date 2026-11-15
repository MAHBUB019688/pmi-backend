const { z } = require("zod");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const productService = require("./product.service");

const availabilityEnum = z.enum([
  "in_stock",
  "out_of_stock",
  "upcoming",
  "pre_order",
]);

const productSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  slug: z.string().optional().nullable(),
  sub: z.string().optional().nullable(),
  price: z.coerce.number(),
  oldPrice: z.coerce.number().optional().nullable(),
  availability: availabilityEnum.optional(),
  isStock: z.boolean().optional(),
  isRestricted: z.boolean().optional(),
  quantity: z.coerce.number().int().optional(),
  thumbnailWeb: z.string().optional().nullable(),
  thumbnailMobile: z.string().optional().nullable(),
  bannerWeb: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  introduction: z.string().optional().nullable(),
  productUse: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  vents: z.string().optional().nullable(),
  feature: z.string().optional().nullable(),
  mips: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  technology: z.string().optional().nullable(),
  certification: z.string().optional().nullable(),
  otherDescription: z.string().optional().nullable(),
  status: z.boolean().optional(),
  images: z.array(z.string()).optional(),
});

const inventorySchema = z.object({
  quantity: z.coerce.number().int().optional(),
  availability: availabilityEnum.optional(),
  isStock: z.boolean().optional(),
});

const trendingSchema = z.object({
  productIds: z.array(z.coerce.number().int().positive()),
});

const list = asyncHandler(async (req, res) => {
  const data = await productService.listProducts(req.query);
  return success(res, { message: "Products fetched", data });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await productService.getProduct(req.params.id);
  return success(res, { message: "Product fetched", data });
});

const create = asyncHandler(async (req, res) => {
  const body = validate(productSchema, req.body);
  const data = await productService.createProduct(body);
  return success(res, { statusCode: 201, message: "Product created", data });
});

const update = asyncHandler(async (req, res) => {
  const body = validate(productSchema.partial(), req.body);
  const data = await productService.updateProduct(req.params.id, body);
  return success(res, { message: "Product updated", data });
});

const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  return success(res, { message: "Product deleted", data: null });
});

const updateInventory = asyncHandler(async (req, res) => {
  const body = validate(inventorySchema, req.body);
  const data = await productService.updateInventory(req.params.id, body);
  return success(res, { message: "Inventory updated", data });
});

const listTrending = asyncHandler(async (_req, res) => {
  const data = await productService.listTrendingProducts();
  return success(res, { message: "Trending products", data });
});

const setTrending = asyncHandler(async (req, res) => {
  const body = validate(trendingSchema, req.body);
  const data = await productService.setTrendingProducts(body.productIds);
  return success(res, { message: "Trending products updated", data });
});

module.exports = {
  list,
  getOne,
  create,
  update,
  remove,
  updateInventory,
  listTrending,
  setTrending,
};
