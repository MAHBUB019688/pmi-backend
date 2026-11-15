const { Router } = require("express");
const { requirePermission } = require("../../middleware/adminAuth");
const controller = require("./store.controller");

const router = Router();
const can = requirePermission("store_manage");

router.get("/", can, controller.list);
router.get("/:id", can, controller.getOne);
router.post("/", can, controller.create);
router.put("/:id", can, controller.update);
router.delete("/:id", can, controller.remove);

module.exports = router;
