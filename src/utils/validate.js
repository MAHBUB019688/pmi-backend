const AppError = require("./AppError");
const rateLimit = require("express-rate-limit");

function validate(schema, payload) {
  const result = schema.safeParse(payload);

  if (result.success) {
    return result.data;
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] ?? "form";
    if (!errors[key]) errors[key] = [];
    errors[key].push(issue.message);
  }

  throw new AppError("Validation failed", 422, undefined, errors);
}

// Prevents brute-force login attacks and API abuse.Protects server resources
//It is a security technique that controls how many requests a client can send to an API within a specific time period.
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: "Too many requests. Try again later.",
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
  // Avoid 500 when clients/proxies send X-Forwarded-For without trust proxy set.
  validate: { xForwardedForHeader: false },
});

// Keep callable default export for: const validate = require(...)
// and named exports for: const { validate, limiter } = require(...)
module.exports = validate;
module.exports.validate = validate;
module.exports.limiter = limiter;
