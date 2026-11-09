const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const controller = require("./order.controller");

const router = Router();

router.post("/customer-address", authenticate, controller.saveAddress);
router.get("/customer-address/:id", authenticate, controller.getAddress);
router.post("/purchases/product", authenticate, controller.purchaseProduct);
router.post("/purchases/ticket", authenticate, controller.purchaseTicket);
router.get("/orders/latest", authenticate, controller.latestOrder);

module.exports = router;
