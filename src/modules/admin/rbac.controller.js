const { z } = require("zod");
const asyncHandler = require("../../utils/asyncHandler");
const validate = require("../../utils/validate");
const { success } = require("../../utils/apiResponse");
const rbacService = require("./rbac.service");

const roleSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.boolean().optional(),
  permissionIds: z.array(z.coerce.number().int().positive()).optional(),
});

const permissionSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional().nullable(),
  groupName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const listRoles = asyncHandler(async (req, res) => {
  const data = await rbacService.listRoles(req.query);
  return success(res, { message: "Roles fetched", data });
});

const getRole = asyncHandler(async (req, res) => {
  const data = await rbacService.getRole(req.params.id);
  return success(res, { message: "Role fetched", data });
});

const createRole = asyncHandler(async (req, res) => {
  const body = validate(roleSchema, req.body);
  const data = await rbacService.createRole(body);
  return success(res, { statusCode: 201, message: "Role created", data });
});

const updateRole = asyncHandler(async (req, res) => {
  const body = validate(roleSchema.partial(), req.body);
  const data = await rbacService.updateRole(req.params.id, body);
  return success(res, { message: "Role updated", data });
});

const deleteRole = asyncHandler(async (req, res) => {
  await rbacService.deleteRole(req.params.id);
  return success(res, { message: "Role deleted", data: null });
});

const listPermissions = asyncHandler(async (_req, res) => {
  const data = await rbacService.listPermissions();
  return success(res, { message: "Permissions fetched", data });
});

const createPermission = asyncHandler(async (req, res) => {
  const body = validate(permissionSchema, req.body);
  const data = await rbacService.createPermission(body);
  return success(res, { statusCode: 201, message: "Permission created", data });
});

module.exports = {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  listPermissions,
  createPermission,
};
