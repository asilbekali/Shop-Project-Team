const Joi = require("joi");

function proValid(data) {
    return Joi.object({
        author_Id: Joi.number().required(),
        name: Joi.string().min(2).max(50).required(),
        description: Joi.string().min(2).max(150).required(),
        price: Joi.number().required(),
        category_Id: Joi.number().required(),
    }).validate(data, { abortEarly: true });
}

module.exports = { proValid };
