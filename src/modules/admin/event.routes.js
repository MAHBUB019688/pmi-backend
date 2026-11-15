const { Router } = require("express");
const { requirePermission } = require("../../middleware/adminAuth");
const controller = require("./event.controller");

const router = Router();
const canManage = requirePermission("event_manage");

router.get("/event-categories", canManage, controller.listEventCategories);
router.get("/event-categories/:id", canManage, controller.getEventCategory);
router.post("/event-categories", canManage, controller.createEventCategory);
router.put("/event-categories/:id", canManage, controller.updateEventCategory);
router.delete("/event-categories/:id", canManage, controller.deleteEventCategory);

router.get("/events", canManage, controller.listEvents);
router.get("/events/:id", canManage, controller.getEvent);
router.post("/events", canManage, controller.createEvent);
router.put("/events/:id", canManage, controller.updateEvent);
router.delete("/events/:id", canManage, controller.deleteEvent);

router.get("/galleries", canManage, controller.listGalleries);
router.get("/galleries/:id", canManage, controller.getGallery);
router.post("/galleries", canManage, controller.createGallery);
router.put("/galleries/:id", canManage, controller.updateGallery);
router.delete("/galleries/:id", canManage, controller.deleteGallery);

module.exports = router;
