const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  markAttendance, getAttendanceByDate, getAttendanceRange,
  getTodayAttendance, getUnmarkedMembers
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

const attendanceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 30,
  message: { message: 'Too many attendance submissions, please try again later' }
});

router.post('/mark', protect, authorize('admin', 'attendance_manager'), attendanceLimiter, auditLog('MARK_ATTENDANCE', 'Attendance'), markAttendance);
router.get('/today', protect, getTodayAttendance);
router.get('/by-date', protect, getAttendanceByDate);
router.get('/range', protect, getAttendanceRange);
router.get('/unmarked', protect, getUnmarkedMembers);

module.exports = router;
