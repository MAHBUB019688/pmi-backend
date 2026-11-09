const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const controller = require("./cart.controller");

const router = Router();

router.use(authenticate);
router.get("/", controller.getCart);
router.post("/add", controller.addToCart);
router.post("/update", controller.updateCart);
router.delete("/remove/:id", controller.removeCart);

module.exports = router;
