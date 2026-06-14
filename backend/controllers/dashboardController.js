const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalMembers,
      maleMembers,
      femaleMembers,
      activeMembers,
      attendanceToday
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ gender: 'male' }),
      Member.countDocuments({ gender: 'female' }),
      Member.countDocuments({ status: 'active' }),
      getTodayAttendanceStats()
    ]);

    const recentAttendance = await Attendance.find()
      .populate('member', 'memberId fullName gender')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10).lean();

    const attendanceTrend = await getAttendanceTrend();

    const locationOverview = await Member.aggregate([
      { $group: { _id: '$province', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      data: {
        totalMembers,
        maleMembers,
        femaleMembers,
        activeMembers,
        ...attendanceToday,
        recentAttendance,
        attendanceTrend,
        locationOverview
      }
    });
  } catch (error) {
    next(error);
  }
};

async function getTodayAttendanceStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const records = await Attendance.find({
    date: { $gte: today, $lt: tomorrow }
  }).lean();

  return {
    presentToday: records.filter(r => r.status === 'present').length,
    absentToday: records.filter(r => r.status === 'absent').length,
    excusedToday: records.filter(r => r.status === 'excused').length,
    lateToday: records.filter(r => r.status === 'late').length,
    totalRecordedToday: records.length
  };
}

async function getAttendanceTrend() {
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: date, $lt: nextDate }
    }).lean();

    trend.push({
      date: date.toISOString().split('T')[0],
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      excused: records.filter(r => r.status === 'excused').length,
      late: records.filter(r => r.status === 'late').length,
      total: records.length
    });
  }
  return trend;
}
