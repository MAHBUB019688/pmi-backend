const { z } = require("zod");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const vendorService = require("./vendor.service");

const vendorSchema = z.object({
  businessName: z.string().min(1),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().min(1),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

const registerSchema = z.object({
  businessName: z.string().min(1),
  contactName: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().min(1),
  address: z.string().optional().nullable(),
});

const rejectSchema = z.object({
  notes: z.string().optional().nullable(),
});

const approveCategorySchema = z.object({
  createCategory: z.boolean().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  image: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().optional(),
});

const list = asyncHandler(async (req, res) => {
  const data = await vendorService.listVendors(req.query);
  return success(res, { message: "Vendors fetched", data });
});

const getOne = asyncHandler(async (req, res) => {
  const data = await vendorService.getVendor(req.params.id);
  return success(res, { message: "Vendor fetched", data });
});

const create = asyncHandler(async (req, res) => {
  const body = validate(vendorSchema, req.body);
  const data = await vendorService.createVendor(body);
  return success(res, { statusCode: 201, message: "Vendor created", data });
});

const register = asyncHandler(async (req, res) => {
  const body = validate(registerSchema, req.body);
  const data = await vendorService.registerVendor(body);
  return success(res, {
    statusCode: 201,
    message: "Vendor registration submitted",
    data,
  });
});

const approve = asyncHandler(async (req, res) => {
  const data = await vendorService.approveVendor(req.params.id);
  return success(res, { message: "Vendor approved", data });
});

const reject = asyncHandler(async (req, res) => {
  const body = validate(rejectSchema, req.body || {});
  const data = await vendorService.rejectVendor(req.params.id, body.notes);
  return success(res, { message: "Vendor rejected", data });
});

const listCategoryRequests = asyncHandler(async (req, res) => {
  const data = await vendorService.listCategoryRequests(req.query);
  return success(res, { message: "Category requests fetched", data });
});

const approveCategoryRequest = asyncHandler(async (req, res) => {
  const body = validate(approveCategorySchema, req.body || {});
  const data = await vendorService.approveCategoryRequest(req.params.id, body);
  return success(res, { message: "Category request approved", data });
});

const rejectCategoryRequest = asyncHandler(async (req, res) => {
  const data = await vendorService.rejectCategoryRequest(req.params.id);
  return success(res, { message: "Category request rejected", data });
});

module.exports = {
  list,
  getOne,
  create,
  register,
  approve,
  reject,
  listCategoryRequests,
  approveCategoryRequest,
  rejectCategoryRequest,
};
