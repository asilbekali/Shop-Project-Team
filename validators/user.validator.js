const Joi = require("joi");

const userValidator = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.email().required(),
  password: Joi.string().required(),
  year: Joi.number().required(),
  region_id: Joi.number().required(),
  image: Joi.string(),
});

module.exports = userValidator;
