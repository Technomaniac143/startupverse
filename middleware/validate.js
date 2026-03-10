const Joi = require("joi");

const evaluateSchema = Joi.object({
    userId: Joi.string().optional(),
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(2000).required(),
    stage: Joi.string().valid("idea", "prototype", "revenue", "scalable").required(),
    techStack: Joi.string().min(2).max(200).required(),
    validation: Joi.string().min(5).max(500).required(),
    fundingNeeded: Joi.number().positive().required(),
    teamSize: Joi.number().integer().min(1).required()
});

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details.map(d => d.message);
            return res.status(400).json({ error: "Validation failed", details: messages });
        }
        next();
    };
};

module.exports = { evaluateSchema, validate };
