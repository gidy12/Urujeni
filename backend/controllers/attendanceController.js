const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const { paginate } = require('../utils/helpers');

exports.markAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];

    for (const record of records) {
      const { memberId, status, notes } = record;

      const member = await Member.findById(memberId).lean();
      if (!member) {
        results.push({ memberId, status: 'error', message: 'Member not found' });
        continue;
      }

      const existing = await Attendance.findOne({
        member: memberId,
        date: attendanceDate
      });

      if (existing) {
        existing.status = status;
        existing.recordedBy = req.user._id;
        existing.notes = notes || existing.notes;
        await existing.save();
        results.push({ memberId, status: 'updated', attendance: existing });
      } else {
        const attendance = await Attendance.create({
          member: memberId,
          date: attendanceDate,
          status,
          recordedBy: req.user._id,
          notes
        });
        results.push({ memberId, status: 'created', attendance });
      }
    }

    res.json({ message: 'Attendance recorded', data: results });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(queryDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const attendance = await Attendance.find({
      date: { $gte: queryDate, $lt: nextDate }
    }).populate('member', 'memberId fullName gender phoneNumber province district')
      .populate('recordedBy', 'name').lean();

    res.json({ data: attendance });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceRange = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query)
      .populate('member', 'memberId fullName gender')
      .populate('recordedBy', 'name')
      .sort({ date: -1 }).lean();

    res.json({ data: attendance });
  } catch (error) {
    next(error);
  }
};

exports.getTodayAttendance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('member', 'memberId fullName gender province district').lean();

    const totalMembers = await Member.countDocuments({ status: 'active' });
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const late = records.filter(r => r.status === 'late').length;

    res.json({
      data: {
        totalMembers,
        totalRecorded: records.length,
        present,
        absent,
        excused,
        late,
        records
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getUnmarkedMembers = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const markedIds = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    }).distinct('member');

    const unmarked = await Member.find({
      _id: { $nin: markedIds },
      status: 'active'
    }).select('memberId fullName gender').lean();

    res.json({ data: unmarked });
  } catch (error) {
    next(error);
  }
};
