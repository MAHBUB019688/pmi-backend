const { Router } = require("express");
const { requirePermission } = require("../../middleware/adminAuth");
const controller = require("./user.controller");

const router = Router();

router.get("/", requirePermission("user_manage"), controller.listUsers);
router.get("/:id", requirePermission("user_manage"), controller.getUser);
router.post("/", requirePermission("user_manage"), controller.createUser);
router.put("/:id", requirePermission("user_manage"), controller.updateUser);
router.delete("/:id", requirePermission("user_manage"), controller.deleteUser);

module.exports = router;
