const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const controller = require("./product.controller");

const router = Router();

router.get("/categories", controller.getCategories);
router.get("/products/search", controller.searchProducts);
router.get("/products/slugs", controller.getProductSlugs);
router.get("/products/restricted", authenticate, controller.getRestrictedProducts);
router.get("/products", controller.getProducts);
router.get("/products/:slug", controller.getProductDetails);
router.get("/product-page", controller.getProductBanner);
router.get("/restricted-product-page", controller.getRestrictedBanner);

module.exports = router;
