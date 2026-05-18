const Joi = require('joi');

const signupSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(6).max(128).required(),
    preferences: Joi.array().items(Joi.string().trim().min(1).max(50)).default([]),
});

const loginSchema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().min(1).required(),
});

const preferencesSchema = Joi.object({
    preferences: Joi.array().items(Joi.string().trim().min(1).max(50)).required(),
});

module.exports = {
    signupSchema,
    loginSchema,
    preferencesSchema,
};
