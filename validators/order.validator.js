const Joi = require("joi");

const orderValidator = Joi.object({
  product_id: Joi.array().required(),
  count: Joi.number().required(),
});

module.exports = orderValidator;
