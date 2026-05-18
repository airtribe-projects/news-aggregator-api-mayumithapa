const jwt = require('jsonwebtoken');
const config = require('../config');
const userStore = require('../store/userStore');
const ApiError = require('../utils/ApiError');

const authenticate = (req, _res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (!token || scheme !== 'Bearer') {
        return next(new ApiError(401, 'Missing or malformed Authorization header'));
    }

    try {
        const payload = jwt.verify(token, config.jwt.secret);
        const user = userStore.findById(payload.sub);
        if (!user) return next(new ApiError(401, 'User no longer exists'));
        req.user = user;
        return next();
    } catch (err) {
        return next(new ApiError(401, 'Invalid or expired token'));
    }
};

module.exports = authenticate;
