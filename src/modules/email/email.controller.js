const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const AppError = require("../../utils/AppError");
const { z } = require("zod");
const { sendMail, isMailConfigured } = require("./email.service");

const testSchema = z.object({
  email: z.string().email("Valid email is required"),
});

const sendTestEmail = asyncHandler(async (req, res) => {
  if (!isMailConfigured()) {
    throw new AppError(
      "SMTP is not configured. Set SMTP_USER and SMTP_PASS in .env",
      503,
    );
  }

  const body = validate(testSchema, req.body);

  await sendMail({
    to: body.email,
    subject: "CARPE DIEM test email",
    text: "This is a test email from the PMI Ecommerce API.",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Test email</h2>
        <p>This is a test email from the PMI Ecommerce API.</p>
      </div>
    `,
  });

  return success(res, { message: "Email sent successfully", data: null });
});

module.exports = { sendTestEmail };
