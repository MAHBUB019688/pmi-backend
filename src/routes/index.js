const { Router } = require("express");
const healthRoutes = require("../modules/health/health.routes");
const authRoutes = require("../modules/auth/auth.routes");
const productRoutes = require("../modules/product/product.route");
const cartRoutes = require("../modules/cart/cart.routes");
const orderRoutes = require("../modules/order/order.routes");
const eventRoutes = require("../modules/event/event.routes");
const cmsRoutes = require("../modules/cms/cms.routes");

const router = Router();

router.use("/health", healthRoutes);
router.use(authRoutes);
router.use(productRoutes);
router.use("/cart", cartRoutes);
router.use(orderRoutes);
router.use(eventRoutes);
router.use(cmsRoutes);

module.exports = router;
