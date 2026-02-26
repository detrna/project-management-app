const Joi = require("joi");

const RoleSchema = {
  create: Joi.object({
    roles: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().trim().required().messages({
            "string.empty": "Role name cannot be empty",
            "any.required": "Role name is required",
          }),
          permission: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().trim().required().messages({
                  "string.base": "Permission name must be a string",
                  "any.required": "Permission name is required",
                }),
                taskId: Joi.number().integer().required().messages({
                  "number.base": "Permission task id must be an integer",
                  "any.required": "Permission task id is required",
                }),
              }),
            )
            .required()
            .unique()
            .messages({
              "array.base": "Permissions must be provided as an array",
              "array.unique": "Duplicate permissions are not allowed",
              "any.required": "At least one permission is required",
            }),
        }),
      )
      .unique()
      .required()
      .messages({
        "array.unique": "Duplicate role are not allowed",
        "array.base": "Roles must be provided as an array",
        "any.required": "The roles array is required",
      }),
  }),

  params: Joi.object({
    projectId: Joi.number().integer().required().messages({
      "any.required": "ProjectId is required",
      "number.base": "ProjectId must be a number",
      "number.integer": "ProjectId must be an integer",
    }),
  }),
};

module.exports = RoleSchema;
