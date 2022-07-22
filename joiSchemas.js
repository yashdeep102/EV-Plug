const Joi = require('joi')
module.exports.joiStationSchema = Joi.object({
    station: Joi.object({
        title: Joi.string().required(),
        // image: Joi.string().required(),
        phone: Joi.number().required().min(999999999),
        location: Joi.string().required(),
        details: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.joiReviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required(),
    }).required()
});

