const { z } = require("zod");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const authService = require("./auth.service");

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone is required"),
  password: z.string().min(1, "Password is required"),
});

const login = asyncHandler(async (req, res) => {
  const body = validate(loginSchema, req.body);
  const data = await authService.login(body);
  return success(res, { message: "Login successful", data });
});

const me = asyncHandler(async (req, res) => {
  const data = await authService.me(req.admin.id);
  return success(res, { message: "Admin profile", data });
});

const logout = asyncHandler(async (_req, res) => {
  return success(res, { message: "Logged out successfully", data: null });
});

module.exports = { login, me, logout };
