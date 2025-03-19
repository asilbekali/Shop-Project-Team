const Joi = require("joi");

const commentValidator = Joi.object({
  text: Joi.string().required(),
  product_id: Joi.number().required(),
  star: Joi.number().required(),
  user_id: Joi.number().required(),
});

module.exports = commentValidator;
