const { z } = require("zod");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const userService = require("./user.service");

const adminUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6).optional(),
  roleIds: z.array(z.coerce.number().int().positive()).optional(),
  status: z.boolean().optional(),
});

const customerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional(),
  isVerified: z.boolean().optional(),
  isRestricted: z.boolean().optional(),
  gender: z.string().optional().nullable(),
});

const listUsers = asyncHandler(async (req, res) => {
  const data = await userService.listAdminUsers(req.query);
  return success(res, { message: "Admin users fetched", data });
});

const getUser = asyncHandler(async (req, res) => {
  const data = await userService.getAdminUser(req.params.id);
  return success(res, { message: "Admin user fetched", data });
});

const createUser = asyncHandler(async (req, res) => {
  const body = validate(adminUserSchema, req.body);
  const data = await userService.createAdminUser(body);
  return success(res, { statusCode: 201, message: "Admin user created", data });
});

const updateUser = asyncHandler(async (req, res) => {
  const body = validate(adminUserSchema.partial(), req.body);
  const data = await userService.updateAdminUser(req.params.id, body);
  return success(res, { message: "Admin user updated", data });
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteAdminUser(req.params.id);
  return success(res, { message: "Admin user deleted", data: null });
});

const listCustomers = asyncHandler(async (req, res) => {
  const data = await userService.listCustomers(req.query);
  return success(res, { message: "Customers fetched", data });
});

const getCustomer = asyncHandler(async (req, res) => {
  const data = await userService.getCustomer(req.params.id);
  return success(res, { message: "Customer fetched", data });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const body = validate(customerSchema, req.body);
  const data = await userService.updateCustomer(req.params.id, body);
  return success(res, { message: "Customer updated", data });
});

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  listCustomers,
  getCustomer,
  updateCustomer,
};
