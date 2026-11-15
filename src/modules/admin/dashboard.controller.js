const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");
const dashboardService = require("./dashboard.service");

const getDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getDashboard(req.query);
  return success(res, { message: "Dashboard data", data });
});

module.exports = { getDashboard };
