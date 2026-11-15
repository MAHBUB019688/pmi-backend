const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const { limiter } = require("../../utils/validate");

const controller = require("./auth.controller");

const router = Router();

router.post("/register/otp/send", limiter, controller.sendRegisterOtp);
router.post("/register/otp/verify", limiter, controller.verifyRegisterOtp);
router.post("/register/otp/resend", controller.resendRegisterOtp);

router.post("/login/otp/send", limiter, controller.sendLoginOtp);
router.post("/login/otp/verify", limiter, controller.verifyLoginOtp);
router.post("/login/firebase", limiter, controller.firebaseLogin);

router.get("/logout", authenticate, controller.logout);
router.get("/profile", authenticate, controller.getProfile);
router.post("/user/is-restricted", authenticate, controller.setRestricted);

module.exports = router;
