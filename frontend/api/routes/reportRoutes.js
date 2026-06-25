const express = require('express');
const router = express.Router();
const {
  getAttendanceReport, getMemberReport, getGenderReport,
  getLocationReport, getReportHistory
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/attendance', protect, getAttendanceReport);
router.get('/members', protect, getMemberReport);
router.get('/gender', protect, getGenderReport);
router.get('/location', protect, getLocationReport);
router.get('/history', protect, authorize('admin'), getReportHistory);

module.exports = router;
