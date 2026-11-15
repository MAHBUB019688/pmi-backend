const { Router } = require("express");
const { requirePermission } = require("../../middleware/adminAuth");
const controller = require("./cms.controller");

const router = Router();
const settings = requirePermission("settings_manage");
const terms = requirePermission("term_manage", "settings_manage");
const compliance = requirePermission("compliance_manage", "settings_manage");

router.get("/page-contents/:key", settings, controller.getPageContent);
router.put("/page-contents/:key", settings, controller.putPageContent);

router.get("/term-categories", terms, controller.listTermCategories);
router.get("/term-categories/:id", terms, controller.getTermCategory);
router.post("/term-categories", terms, controller.createTermCategory);
router.put("/term-categories/:id", terms, controller.updateTermCategory);
router.delete("/term-categories/:id", terms, controller.deleteTermCategory);

router.get("/terms", terms, controller.listTerms);
router.get("/terms/:id", terms, controller.getTerm);
router.post("/terms", terms, controller.createTerm);
router.put("/terms/:id", terms, controller.updateTerm);
router.delete("/terms/:id", terms, controller.deleteTerm);

router.get("/compliance-categories", compliance, controller.listComplianceCategories);
router.get("/compliance-categories/:id", compliance, controller.getComplianceCategory);
router.post("/compliance-categories", compliance, controller.createComplianceCategory);
router.put("/compliance-categories/:id", compliance, controller.updateComplianceCategory);
router.delete(
  "/compliance-categories/:id",
  compliance,
  controller.deleteComplianceCategory,
);

router.get("/compliances", compliance, controller.listCompliances);
router.get("/compliances/:id", compliance, controller.getCompliance);
router.post("/compliances", compliance, controller.createCompliance);
router.put("/compliances/:id", compliance, controller.updateCompliance);
router.delete("/compliances/:id", compliance, controller.deleteCompliance);

router.get("/compliance-contacts", compliance, controller.listComplianceContacts);
router.get("/compliance-contacts/:id", compliance, controller.getComplianceContact);
router.post("/compliance-contacts", compliance, controller.createComplianceContact);
router.put("/compliance-contacts/:id", compliance, controller.updateComplianceContact);
router.delete(
  "/compliance-contacts/:id",
  compliance,
  controller.deleteComplianceContact,
);

router.get("/compliance-meta", compliance, controller.getComplianceMeta);
router.put("/compliance-meta", compliance, controller.updateComplianceMeta);

module.exports = router;
