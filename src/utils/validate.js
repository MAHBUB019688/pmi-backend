const AppError = require("./AppError");

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

module.exports = validate;
