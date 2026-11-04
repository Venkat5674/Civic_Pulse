const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    return sendSuccess(res, result, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    return sendSuccess(res, { user }, 'User retrieved');
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const result = await authService.requestPasswordReset(req.body.email);
    return sendSuccess(res, result, result.message);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    return sendSuccess(res, {}, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await authService.resetPassword(req.body);
    return sendSuccess(res, result, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const result = await authService.changePassword({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });
    return sendSuccess(res, result, result.message);
  } catch (err) {
    next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const token = req.body?.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    const result = await authService.refreshToken(token, req.user);
    return sendSuccess(res, result, 'Token refreshed successfully');
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const updated = await authService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, { user: updated }, 'Profile preferences updated successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  logout,
  resetPassword,
  changePassword,
  refreshToken,
  updateProfile,
};


