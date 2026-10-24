const { Router } = require("express");
const healthRoutes = require("../modules/health/health.routes");
const studentRoutes = require("../modules/student/student.route");

const router = Router();

router.use("/health", healthRoutes);
router.use("/students", studentRoutes);

module.exports = router;
