const { z } = require("zod");

const phoneSchema = z
  .string()
  .min(10, "Phone is required")
  .max(20, "Phone is too long");

const registerSendSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: phoneSchema,
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
});

const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: z.string().min(4, "OTP is required").max(8),
});

const phoneOnlySchema = z.object({
  phone: phoneSchema,
});

const firebaseSchema = z.object({
  token: z.string().min(10, "Token is required"),
});

const restrictedSchema = z.object({
  is_restricted: z.boolean(),
});

module.exports = {
  registerSendSchema,
  otpVerifySchema,
  phoneOnlySchema,
  firebaseSchema,
  restrictedSchema,
};
