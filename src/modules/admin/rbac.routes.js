const { Router } = require("express");
const { requirePermission } = require("../../middleware/adminAuth");
const controller = require("./rbac.controller");

const router = Router();

router.get("/roles", requirePermission("role_manage"), controller.listRoles);
router.get("/roles/:id", requirePermission("role_manage"), controller.getRole);
router.post("/roles", requirePermission("role_manage"), controller.createRole);
router.put("/roles/:id", requirePermission("role_manage"), controller.updateRole);
router.delete("/roles/:id", requirePermission("role_manage"), controller.deleteRole);

router.get(
  "/permissions",
  requirePermission("permission_manage", "role_manage"),
  controller.listPermissions,
);
router.post(
  "/permissions",
  requirePermission("permission_manage"),
  controller.createPermission,
);

module.exports = router;
