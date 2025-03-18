const Joi = require("joi");

function regionVali(data) {
    return Joi.object({
        name: Joi.string().min(2).max(50).required(),
    }).validate(data, { abortEarly: true });
}

module.exports = { regionVali };
