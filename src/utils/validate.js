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

//Prevents brute-force login attacks.
//Protects APIs from excessive requests.
//Reduces spam and automated abuse.
//Helps prevent some DoS attacks.
//Protects server resources.
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
});

module.exports = {
  validate,
  limiter,
};
