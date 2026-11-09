const { Router } = require("express");
const controller = require("./email.controller");

const router = Router();

router.post("/email/test", controller.sendTestEmail);

module.exports = router;
