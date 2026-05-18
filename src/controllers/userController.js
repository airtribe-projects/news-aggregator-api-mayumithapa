const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userStore = require('../store/userStore');
const ApiError = require('../utils/ApiError');

const toPublic = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    preferences: user.preferences,
});

const signup = async (req, res) => {
    const { name, email, password, preferences } = req.body;

    if (userStore.findByEmail(email)) {
        throw new ApiError(409, 'A user with that email already exists');
    }

    const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const user = userStore.createUser({
        name,
        email,
        passwordHash,
        preferences: preferences || [],
    });

    res.status(200).json({
        message: 'User registered successfully',
        user: toPublic(user),
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = userStore.findByEmail(email);
    if (!user) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const token = jwt.sign(
        { sub: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn },
    );

    res.status(200).json({
        message: 'Login successful',
        token,
        user: toPublic(user),
    });
};

const getPreferences = async (req, res) => {
    res.status(200).json({ preferences: req.user.preferences });
};

const updatePreferences = async (req, res) => {
    const updated = userStore.updatePreferences(req.user.id, req.body.preferences);
    res.status(200).json({
        message: 'Preferences updated successfully',
        preferences: updated.preferences,
    });
};

module.exports = {
    signup,
    login,
    getPreferences,
    updatePreferences,
};
