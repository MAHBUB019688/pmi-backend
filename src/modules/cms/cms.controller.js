const cmsService = require("./cms.service");
const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");

const getStores = asyncHandler(async (req, res) => {
  const data = await cmsService.getStores(req.query.search);
  return success(res, { message: "Stores fetched", data });
});

const getTerms = asyncHandler(async (_req, res) => {
  const data = await cmsService.getTerms();
  return success(res, { message: "Terms fetched", data });
});

const getCompliance = asyncHandler(async (_req, res) => {
  const data = await cmsService.getCompliance();
  return success(res, { message: "Compliance fetched", data });
});

const getGalleries = asyncHandler(async (req, res) => {
  const data = await cmsService.getGalleries(req.query);
  return success(res, { message: "Galleries fetched", data });
});

const getGalleryMeta = asyncHandler(async (_req, res) => {
  const data = await cmsService.getGalleryPageMeta();
  return success(res, { message: "Gallery page meta", data });
});

module.exports = {
  getStores,
  getTerms,
  getCompliance,
  getGalleries,
  getGalleryMeta,
};
