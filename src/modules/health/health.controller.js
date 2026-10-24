const { success } = require("../../utils/apiResponse");

function getHealth(_req, res) {
  return success(res, {
    message: "Service is healthy",
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { getHealth };
