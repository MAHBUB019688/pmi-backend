const { z } = require("zod");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const categoryService = require("./category.service");

const categorySchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
  status: z.boolean().optional(),
});

const list = asyncHandler(async (req, res) => {
  const data = await categoryService.listCategories(req.query);
  return success(res, { message: "Categories fetched", data });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await categoryService.getCategory(req.params.id);
  return success(res, { message: "Category fetched", data });
});

const create = asyncHandler(async (req, res) => {
  const body = validate(categorySchema, req.body);
  const data = await categoryService.createCategory(body);
  return success(res, { statusCode: 201, message: "Category created", data });
});

const update = asyncHandler(async (req, res) => {
  const body = validate(categorySchema.partial(), req.body);
  const data = await categoryService.updateCategory(req.params.id, body);
  return success(res, { message: "Category updated", data });
});

const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  return success(res, { message: "Category deleted", data: null });
});

module.exports = { list, getOne, create, update, remove };
