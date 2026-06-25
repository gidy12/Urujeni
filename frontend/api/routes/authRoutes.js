const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  register, login, getMe, updateProfile, changePassword, logout,
  adminCreateUser, forgotPassword, resetPassword, googleLogin
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  message: { message: 'Too many login attempts, please try again later' }
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);
router.post('/admin-create', protect, authorize('admin'), adminCreateUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/google', googleLogin);

module.exports = router;
