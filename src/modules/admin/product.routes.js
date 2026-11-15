const { Router } = require("express");
const { requirePermission } = require("../../middleware/adminAuth");
const controller = require("./product.controller");

const router = Router();

router.get("/", requirePermission("product_manage"), controller.list);
router.get("/:id", requirePermission("product_manage"), controller.getOne);
router.post("/", requirePermission("product_manage"), controller.create);
router.put("/:id", requirePermission("product_manage"), controller.update);
router.delete("/:id", requirePermission("product_manage"), controller.remove);
router.patch(
  "/:id/inventory",
  requirePermission("inventory_manage", "product_manage"),
  controller.updateInventory,
);

module.exports = router;
