const express = require('express');
const router = express.Router();
const {
  register, login, getMe, updateProfile, changePassword, logout,
  adminCreateUser, forgotPassword, resetPassword, googleLogin
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);
router.post('/admin-create', protect, authorize('admin'), adminCreateUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/google', googleLogin);

module.exports = router;
