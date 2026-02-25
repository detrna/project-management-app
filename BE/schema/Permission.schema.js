const Joi = require("joi");

const PermissionSchema = {
  projectIdParams: Joi.object({
    id: Joi.number().integer().required().messages({
      "number.required": "Params is required",
      "number.base": "Value must be an integer",
    }),
  }),
  create: Joi.object({
    roleId: Joi.array()
      .items(
        Joi.number()
          .integer()
          .messages({ "number.base": "Role id value must be a an integer" }),
      )
      .unique()
      .required()
      .messages({
        "Array.required": "Role id field is required",
      }),
    taskId: Joi.array()
      .items(
        Joi.number()
          .integer()
          .messages({ "number.base": "Task id value must be a an integer" }),
      )
      .required()
      .messages({
        "Array.required": "Task id field is required",
      }),
  }),
};

module.exports = PermissionSchema;
