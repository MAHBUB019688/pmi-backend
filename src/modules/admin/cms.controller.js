const { z } = require("zod");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const cmsService = require("./cms.service");

const pageContentSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  data: z.any(),
});

const termCategorySchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  iconImage: z.string().optional().nullable(),
  iconImageUrl: z.string().optional().nullable(),
  status: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

const termSchema = z.object({
  termCategoryId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  acknowledgment: z.string().optional().nullable(),
  description: z.string().min(1),
});

const complianceCategorySchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  iconImage: z.string().optional().nullable(),
  iconImageUrl: z.string().optional().nullable(),
  status: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

const complianceSchema = z.object({
  complianceCategoryId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  acknowledgment: z.string().optional().nullable(),
  descriptionTitle: z.string().optional().nullable(),
  description: z.string().min(1),
});

const contactSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string().min(1),
});

const metaSchema = z.object({
  mainSubtitleDescription: z.string().min(1),
});

const getPageContent = asyncHandler(async (req, res) => {
  const data = await cmsService.getPageContent(req.params.key);
  return success(res, { message: "Page content fetched", data });
});

const putPageContent = asyncHandler(async (req, res) => {
  const body = validate(pageContentSchema, req.body);
  const data = await cmsService.upsertPageContent(req.params.key, body);
  return success(res, { message: "Page content updated", data });
});

const listTermCategories = asyncHandler(async (req, res) => {
  const data = await cmsService.listTermCategories(req.query);
  return success(res, { message: "Term categories fetched", data });
});
const getTermCategory = asyncHandler(async (req, res) => {
  const data = await cmsService.getTermCategory(req.params.id);
  return success(res, { message: "Term category fetched", data });
});
const createTermCategory = asyncHandler(async (req, res) => {
  const body = validate(termCategorySchema, req.body);
  const data = await cmsService.createTermCategory(body);
  return success(res, { statusCode: 201, message: "Term category created", data });
});
const updateTermCategory = asyncHandler(async (req, res) => {
  const body = validate(termCategorySchema.partial(), req.body);
  const data = await cmsService.updateTermCategory(req.params.id, body);
  return success(res, { message: "Term category updated", data });
});
const deleteTermCategory = asyncHandler(async (req, res) => {
  await cmsService.deleteTermCategory(req.params.id);
  return success(res, { message: "Term category deleted", data: null });
});

const listTerms = asyncHandler(async (req, res) => {
  const data = await cmsService.listTerms(req.query);
  return success(res, { message: "Terms fetched", data });
});
const getTerm = asyncHandler(async (req, res) => {
  const data = await cmsService.getTerm(req.params.id);
  return success(res, { message: "Term fetched", data });
});
const createTerm = asyncHandler(async (req, res) => {
  const body = validate(termSchema, req.body);
  const data = await cmsService.createTerm(body);
  return success(res, { statusCode: 201, message: "Term created", data });
});
const updateTerm = asyncHandler(async (req, res) => {
  const body = validate(termSchema.partial(), req.body);
  const data = await cmsService.updateTerm(req.params.id, body);
  return success(res, { message: "Term updated", data });
});
const deleteTerm = asyncHandler(async (req, res) => {
  await cmsService.deleteTerm(req.params.id);
  return success(res, { message: "Term deleted", data: null });
});

const listComplianceCategories = asyncHandler(async (req, res) => {
  const data = await cmsService.listComplianceCategories(req.query);
  return success(res, { message: "Compliance categories fetched", data });
});
const getComplianceCategory = asyncHandler(async (req, res) => {
  const data = await cmsService.getComplianceCategory(req.params.id);
  return success(res, { message: "Compliance category fetched", data });
});
const createComplianceCategory = asyncHandler(async (req, res) => {
  const body = validate(complianceCategorySchema, req.body);
  const data = await cmsService.createComplianceCategory(body);
  return success(res, {
    statusCode: 201,
    message: "Compliance category created",
    data,
  });
});
const updateComplianceCategory = asyncHandler(async (req, res) => {
  const body = validate(complianceCategorySchema.partial(), req.body);
  const data = await cmsService.updateComplianceCategory(req.params.id, body);
  return success(res, { message: "Compliance category updated", data });
});
const deleteComplianceCategory = asyncHandler(async (req, res) => {
  await cmsService.deleteComplianceCategory(req.params.id);
  return success(res, { message: "Compliance category deleted", data: null });
});

const listCompliances = asyncHandler(async (req, res) => {
  const data = await cmsService.listCompliances(req.query);
  return success(res, { message: "Compliances fetched", data });
});
const getCompliance = asyncHandler(async (req, res) => {
  const data = await cmsService.getCompliance(req.params.id);
  return success(res, { message: "Compliance fetched", data });
});
const createCompliance = asyncHandler(async (req, res) => {
  const body = validate(complianceSchema, req.body);
  const data = await cmsService.createCompliance(body);
  return success(res, { statusCode: 201, message: "Compliance created", data });
});
const updateCompliance = asyncHandler(async (req, res) => {
  const body = validate(complianceSchema.partial(), req.body);
  const data = await cmsService.updateCompliance(req.params.id, body);
  return success(res, { message: "Compliance updated", data });
});
const deleteCompliance = asyncHandler(async (req, res) => {
  await cmsService.deleteCompliance(req.params.id);
  return success(res, { message: "Compliance deleted", data: null });
});

const listComplianceContacts = asyncHandler(async (_req, res) => {
  const data = await cmsService.listComplianceContacts();
  return success(res, { message: "Compliance contacts fetched", data });
});
const getComplianceContact = asyncHandler(async (req, res) => {
  const data = await cmsService.getComplianceContact(req.params.id);
  return success(res, { message: "Compliance contact fetched", data });
});
const createComplianceContact = asyncHandler(async (req, res) => {
  const body = validate(contactSchema, req.body);
  const data = await cmsService.createComplianceContact(body);
  return success(res, {
    statusCode: 201,
    message: "Compliance contact created",
    data,
  });
});
const updateComplianceContact = asyncHandler(async (req, res) => {
  const body = validate(contactSchema.partial(), req.body);
  const data = await cmsService.updateComplianceContact(req.params.id, body);
  return success(res, { message: "Compliance contact updated", data });
});
const deleteComplianceContact = asyncHandler(async (req, res) => {
  await cmsService.deleteComplianceContact(req.params.id);
  return success(res, { message: "Compliance contact deleted", data: null });
});

const getComplianceMeta = asyncHandler(async (_req, res) => {
  const data = await cmsService.getComplianceMeta();
  return success(res, { message: "Compliance meta fetched", data });
});
const updateComplianceMeta = asyncHandler(async (req, res) => {
  const body = validate(metaSchema, req.body);
  const data = await cmsService.updateComplianceMeta(body);
  return success(res, { message: "Compliance meta updated", data });
});

module.exports = {
  getPageContent,
  putPageContent,
  listTermCategories,
  getTermCategory,
  createTermCategory,
  updateTermCategory,
  deleteTermCategory,
  listTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
  listComplianceCategories,
  getComplianceCategory,
  createComplianceCategory,
  updateComplianceCategory,
  deleteComplianceCategory,
  listCompliances,
  getCompliance,
  createCompliance,
  updateCompliance,
  deleteCompliance,
  listComplianceContacts,
  getComplianceContact,
  createComplianceContact,
  updateComplianceContact,
  deleteComplianceContact,
  getComplianceMeta,
  updateComplianceMeta,
};
