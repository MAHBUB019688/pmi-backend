const { Router } = require("express");
const { authenticateAdmin } = require("../../middleware/adminAuth");
const controller = require("./auth.controller");

const router = Router();

router.post("/login", controller.login);
router.get("/me", authenticateAdmin, controller.me);
router.post("/logout", authenticateAdmin, controller.logout);

module.exports = router;
