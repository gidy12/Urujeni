const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const Report = require('../models/Report');
const { getDateRange } = require('../utils/helpers');

exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;
    let dateRange;

    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    } else {
      dateRange = getDateRange(type || 'daily');
    }

    const attendance = await Attendance.find({
      date: { $gte: dateRange.start, $lt: dateRange.end }
    }).populate('member', 'memberId fullName gender province district');

    const totalMembers = await Member.countDocuments({ status: 'active' });
    const summary = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      excused: attendance.filter(a => a.status === 'excused').length,
      late: attendance.filter(a => a.status === 'late').length,
      totalMembers
    };

    const report = await Report.create({
      title: `${type || 'custom'} Attendance Report`,
      type: type || 'daily',
      generatedBy: req.user._id,
      dateRange,
      data: { summary, records: attendance }
    });

    res.json({ data: { summary, records: attendance, report } });
  } catch (error) {
    next(error);
  }
};

exports.getMemberReport = async (req, res, next) => {
  try {
    const totalMembers = await Member.countDocuments();
    const activeMembers = await Member.countDocuments({ status: 'active' });
    const inactiveMembers = await Member.countDocuments({ status: 'inactive' });
    const male = await Member.countDocuments({ gender: 'male' });
    const female = await Member.countDocuments({ gender: 'female' });

    const locationStats = await Member.aggregate([
      {
        $group: {
          _id: { province: '$province', district: '$district' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.province': 1 } }
    ]);

    const reportData = {
      totalMembers,
      activeMembers,
      inactiveMembers,
      male,
      female,
      locationStats
    };

    const report = await Report.create({
      title: 'Member Registration Report',
      type: 'members',
      generatedBy: req.user._id,
      data: reportData
    });

    res.json({ data: { ...reportData, report } });
  } catch (error) {
    next(error);
  }
};

exports.getGenderReport = async (req, res, next) => {
  try {
    const male = await Member.countDocuments({ gender: 'male' });
    const female = await Member.countDocuments({ gender: 'female' });
    const total = male + female;

    const genderByProvince = await Member.aggregate([
      {
        $group: {
          _id: { province: '$province', gender: '$gender' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.province': 1 } }
    ]);

    res.json({
      data: {
        total,
        male,
        female,
        malePercentage: total ? ((male / total) * 100).toFixed(1) : 0,
        femalePercentage: total ? ((female / total) * 100).toFixed(1) : 0,
        byProvince: genderByProvince
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getLocationReport = async (req, res, next) => {
  try {
    const byProvince = await Member.aggregate([
      { $group: { _id: '$province', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byDistrict = await Member.aggregate([
      { $group: { _id: { province: '$province', district: '$district' }, count: { $sum: 1 } } },
      { $sort: { '_id.province': 1, count: -1 } }
    ]);

    res.json({ data: { byProvince, byDistrict } });
  } catch (error) {
    next(error);
  }
};

exports.getReportHistory = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('generatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ data: reports });
  } catch (error) {
    next(error);
  }
};
