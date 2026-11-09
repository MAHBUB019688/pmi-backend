const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const controller = require("./auth.controller");

const router = Router();

router.post("/register/otp/send", controller.sendRegisterOtp);
router.post("/register/otp/verify", controller.verifyRegisterOtp);
router.post("/register/otp/resend", controller.resendRegisterOtp);

router.post("/login/otp/send", controller.sendLoginOtp);
router.post("/login/otp/verify", controller.verifyLoginOtp);
router.post("/login/firebase", controller.firebaseLogin);

router.get("/logout", authenticate, controller.logout);
router.get("/profile", authenticate, controller.getProfile);
router.post("/user/is-restricted", authenticate, controller.setRestricted);

module.exports = router;
