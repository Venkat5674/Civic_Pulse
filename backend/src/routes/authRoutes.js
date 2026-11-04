const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateBody } = require('../middleware/validate');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, refreshSchema, changePasswordSchema } = require('../validators/authValidators');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.patch('/profile', authenticateToken, authController.updateProfile);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), authController.resetPassword);
router.post('/change-password', authenticateToken, validateBody(changePasswordSchema), authController.changePassword);
router.post('/refresh', optionalAuth, validateBody(refreshSchema), authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;


