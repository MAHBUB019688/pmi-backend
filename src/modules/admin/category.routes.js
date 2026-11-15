const { Router } = require("express");
const { requirePermission } = require("../../middleware/adminAuth");
const controller = require("./category.controller");

const router = Router();

router.get("/", requirePermission("category_manage"), controller.list);
router.get("/:id", requirePermission("category_manage"), controller.getOne);
router.post("/", requirePermission("category_manage"), controller.create);
router.put("/:id", requirePermission("category_manage"), controller.update);
router.delete("/:id", requirePermission("category_manage"), controller.remove);

module.exports = router;
