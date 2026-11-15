const { Router } = require("express");
const { requirePermission } = require("../../middleware/adminAuth");
const controller = require("./dashboard.controller");

const router = Router();

router.get("/", requirePermission("dashboard_view"), controller.getDashboard);

module.exports = router;
