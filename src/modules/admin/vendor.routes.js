const { Router } = require("express");
const { requirePermission } = require("../../middleware/adminAuth");
const controller = require("./vendor.controller");

const router = Router();

router.get(
  "/",
  requirePermission("vendor_registration_manage"),
  controller.list,
);
router.get(
  "/:id",
  requirePermission("vendor_registration_manage"),
  controller.getOne,
);
router.post(
  "/",
  requirePermission("vendor_registration_manage"),
  controller.create,
);
router.patch(
  "/:id/approve",
  requirePermission("vendor_registration_manage"),
  controller.approve,
);
router.patch(
  "/:id/reject",
  requirePermission("vendor_registration_manage"),
  controller.reject,
);

module.exports = router;
