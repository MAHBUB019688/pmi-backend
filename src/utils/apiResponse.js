function success(res, { data = null, message = "OK", statusCode = 200 } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function fail(res, { message = "Request failed", statusCode = 400, details } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}

module.exports = { success, fail };
