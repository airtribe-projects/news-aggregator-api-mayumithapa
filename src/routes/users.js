const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const {
    signupSchema,
    loginSchema,
    preferencesSchema,
} = require('../validators/schemas');

const router = express.Router();

router.post('/signup', validate(signupSchema), asyncHandler(userController.signup));
router.post('/login', validate(loginSchema), asyncHandler(userController.login));

router.get(
    '/preferences',
    authenticate,
    asyncHandler(userController.getPreferences),
);
router.put(
    '/preferences',
    authenticate,
    validate(preferencesSchema),
    asyncHandler(userController.updatePreferences),
);

module.exports = router;
