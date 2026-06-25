const express = require('express');
const router = express.Router();
const {
  getMembers, getMember, createMember, updateMember, deleteMember,
  getMembersByLocation, getLocations
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');
const { auditLog } = require('../middleware/auditLog');

router.route('/')
  .get(protect, getMembers)
  .post(protect, authorize('admin', 'attendance_manager'), auditLog('CREATE_MEMBER', 'Member'), createMember);

router.route('/:id')
  .get(protect, getMember)
  .put(protect, authorize('admin', 'attendance_manager'), auditLog('UPDATE_MEMBER', 'Member'), updateMember)
  .delete(protect, authorize('admin'), auditLog('DELETE_MEMBER', 'Member'), deleteMember);

router.get('/locations/overview', protect, getMembersByLocation);
router.get('/locations/list', protect, getLocations);

module.exports = router;
