const authService = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const {
  registerSendSchema,
  otpVerifySchema,
  phoneOnlySchema,
  firebaseSchema,
  restrictedSchema,
} = require("./auth.validation");

const sendRegisterOtp = asyncHandler(async (req, res) => {
  const data = validate(registerSendSchema, req.body);
  const result = await authService.sendRegisterOtp(data);
  return success(res, result);
});

const verifyRegisterOtp = asyncHandler(async (req, res) => {
  const data = validate(otpVerifySchema, req.body);
  const result = await authService.verifyRegisterOtp(data);
  return success(res, result);
});

const resendRegisterOtp = asyncHandler(async (req, res) => {
  const data = validate(phoneOnlySchema, req.body);
  const result = await authService.resendRegisterOtp(data);
  return success(res, result);
});

const sendLoginOtp = asyncHandler(async (req, res) => {
  const data = validate(phoneOnlySchema, req.body);
  const result = await authService.sendLoginOtp(data);
  return success(res, result);
});

const verifyLoginOtp = asyncHandler(async (req, res) => {
  const data = validate(otpVerifySchema, req.body);
  const result = await authService.verifyLoginOtp(data);
  return success(res, result);
});

const firebaseLogin = asyncHandler(async (req, res) => {
  const data = validate(firebaseSchema, req.body);
  const result = await authService.firebaseLogin(data);
  return success(res, result);
});

const logout = asyncHandler(async (_req, res) => {
  return success(res, { message: "Logged out successfully", data: null });
});

const getProfile = asyncHandler(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  return success(res, { data, message: "Profile fetched" });
});

const setRestricted = asyncHandler(async (req, res) => {
  const body = validate(restrictedSchema, req.body);
  const data = await authService.setRestricted(
    req.user.id,
    body.is_restricted,
  );
  return success(res, {
    message: "Age permission updated",
    data,
  });
});

module.exports = {
  sendRegisterOtp,
  verifyRegisterOtp,
  resendRegisterOtp,
  sendLoginOtp,
  verifyLoginOtp,
  firebaseLogin,
  logout,
  getProfile,
  setRestricted,
};
