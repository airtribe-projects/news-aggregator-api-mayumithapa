const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
    if (err instanceof ApiError) {
        const body = { error: err.message };
        if (err.details) body.details = err.details;
        return res.status(err.status).json(body);
    }

    if (err && err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    // Unhandled: keep stack out of the response but log it for debugging.
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
};

const notFoundHandler = (_req, res) => {
    res.status(404).json({ error: 'Not found' });
};

module.exports = { errorHandler, notFoundHandler };
