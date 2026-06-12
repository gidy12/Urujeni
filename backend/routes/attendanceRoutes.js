const express = require('express');
const router = express.Router();
const {
  markAttendance, getAttendanceByDate, getAttendanceRange,
  getTodayAttendance, getUnmarkedMembers
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

router.post('/mark', protect, authorize('admin', 'attendance_manager'), auditLog('MARK_ATTENDANCE', 'Attendance'), markAttendance);
router.get('/today', protect, getTodayAttendance);
router.get('/by-date', protect, getAttendanceByDate);
router.get('/range', protect, getAttendanceRange);
router.get('/unmarked', protect, getUnmarkedMembers);

module.exports = router;
