const ApiError = require('../utils/ApiError');

const validate = (schema, source = 'body') => (req, _res, next) => {
    const { value, error } = schema.validate(req[source], {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
    });

    if (error) {
        return next(
            new ApiError(400, 'Invalid request payload', {
                fields: error.details.map((d) => ({
                    field: d.path.join('.'),
                    message: d.message,
                })),
            }),
        );
    }

    req[source] = value;
    return next();
};

module.exports = validate;
