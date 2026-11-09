const { Router } = require("express");
const controller = require("./cms.controller");

const router = Router();

router.get("/stores", controller.getStores);
router.get("/terms-and-conditions", controller.getTerms);
router.get("/compliance-categories", controller.getCompliance);
router.get("/galleries", controller.getGalleries);
router.get("/galleries-page", controller.getGalleryMeta);

module.exports = router;
