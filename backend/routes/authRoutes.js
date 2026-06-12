const express = require('express');
const router = express.Router();
const {
  register, login, getMe, updateProfile, changePassword, logout,
  adminCreateUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/logout', protect, logout);
router.post('/admin-create', protect, authorize('admin'), adminCreateUser);

module.exports = router;
