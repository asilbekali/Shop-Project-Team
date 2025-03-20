const Joi = require("joi");

const orderValidator = Joi.object({
  user_id: Joi.number().required(),
});

module.exports = orderValidator;
