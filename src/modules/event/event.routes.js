const { Router } = require("express");
const controller = require("./event.controller");

const router = Router();

router.get("/home", controller.getHome);
router.get("/events/upcoming", controller.getUpcoming);
router.get("/events/slugs", controller.getEventSlugs);
router.get("/events/:slug", controller.getDetails);

module.exports = router;
