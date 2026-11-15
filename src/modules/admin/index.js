const { Router } = require("express");
const {
  authenticateAdmin,
  requirePermission,
} = require("../../middleware/adminAuth");
const vendorController = require("./vendor.controller");
const productController = require("./product.controller");
const userController = require("./user.controller");

const authRoutes = require("./auth.routes");
const dashboardRoutes = require("./dashboard.routes");
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const eventRoutes = require("./event.routes");
const orderRoutes = require("./order.routes");
const vendorRoutes = require("./vendor.routes");
const storeRoutes = require("./store.routes");
const userRoutes = require("./user.routes");
const cmsRoutes = require("./cms.routes");
const rbacRoutes = require("./rbac.routes");

const router = Router();

// Public endpoints (no admin auth)
router.use("/auth", authRoutes);
router.post("/vendors/register", vendorController.register);

// Protected admin API
router.use(authenticateAdmin);

router.use("/dashboard", dashboardRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.get(
  "/trending-products",
  requirePermission("trending_manage", "product_manage"),
  productController.listTrending,
);
router.put(
  "/trending-products",
  requirePermission("trending_manage"),
  productController.setTrending,
);
router.use(eventRoutes);
router.use("/orders", orderRoutes);
router.use("/vendors", vendorRoutes);
router.get(
  "/category-requests",
  requirePermission("category_request_manage"),
  vendorController.listCategoryRequests,
);
router.patch(
  "/category-requests/:id/approve",
  requirePermission("category_request_manage"),
  vendorController.approveCategoryRequest,
);
router.patch(
  "/category-requests/:id/reject",
  requirePermission("category_request_manage"),
  vendorController.rejectCategoryRequest,
);
router.use("/stores", storeRoutes);
router.use("/users", userRoutes);
router.get(
  "/customers",
  requirePermission("customer_manage"),
  userController.listCustomers,
);
router.get(
  "/customers/:id",
  requirePermission("customer_manage"),
  userController.getCustomer,
);
router.put(
  "/customers/:id",
  requirePermission("customer_manage"),
  userController.updateCustomer,
);
router.use(cmsRoutes);
router.use(rbacRoutes);

module.exports = router;
