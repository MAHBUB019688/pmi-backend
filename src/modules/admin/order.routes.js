const { Router } = require("express");
const { requirePermission } = require("../../middleware/adminAuth");
const controller = require("./order.controller");

const router = Router();

router.get("/", requirePermission("order_list", "order_manage"), controller.list);
router.get("/:id", requirePermission("order_list", "order_manage"), controller.getOne);
router.patch(
  "/:id/status",
  requirePermission("order_manage"),
  controller.updateStatus,
);

module.exports = router;
