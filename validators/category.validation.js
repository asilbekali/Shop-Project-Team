const Joi = require("joi");

function categoryVali(data) {
    return Joi.object({
        name: Joi.string().min(2).max(50).required(),
    }).validate(data, { abortEarly: true });
}

module.exports = { categoryVali };
