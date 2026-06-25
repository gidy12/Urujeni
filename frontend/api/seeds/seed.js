require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Member = require('../models/Member');
const Attendance = require('../models/Attendance');
const connectDB = require('../config/db');

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Member.deleteMany({}),
      Attendance.deleteMany({})
    ]);

    console.log('Seeding users...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@urujeni.com',
      password: 'admin123',
      role: 'admin',
      phone: '+250788000001'
    });

    await User.create({
      name: 'Attendance Manager',
      email: 'manager@urujeni.com',
      password: 'manager123',
      role: 'attendance_manager',
      phone: '+250788000002'
    });

    console.log('Seeding members...');
     const membersData = [
      { memberId: 'URJ-2024-0001', fullName: 'Jean Baptiste Habimana', gender: 'male', dateOfBirth: new Date('1995-03-15'), phoneNumber: '+250788100001', emailAddress: 'jean@example.com', province: 'Kigali', district: 'Nyarugenge', sector: 'Nyamirambo', cell: 'Amahoro', village: 'Isoko', role: 'dancer', status: 'active' },
      { memberId: 'URJ-2024-0002', fullName: 'Marie Claire Uwimana', gender: 'female', dateOfBirth: new Date('1998-07-22'), phoneNumber: '+250788100002', emailAddress: 'marie@example.com', province: 'Kigali', district: 'Gasabo', sector: 'Kimironko', cell: 'Ubumwe', village: 'Inzuki', role: 'singer', status: 'active' },
      { memberId: 'URJ-2024-0003', fullName: 'Patrick Niyonzima', gender: 'male', dateOfBirth: new Date('2000-01-10'), phoneNumber: '+250788100003', emailAddress: 'patrick@example.com', province: 'Eastern', district: 'Bugesera', sector: 'Nyamata', cell: 'Mubuga', village: 'Gishubi', role: 'drummer', status: 'active' },
      { memberId: 'URJ-2024-0004', fullName: 'Aline Mukamana', gender: 'female', dateOfBirth: new Date('1997-11-05'), phoneNumber: '+250788100004', emailAddress: 'aline@example.com', province: 'Northern', district: 'Musanze', sector: 'Muhoza', cell: 'Gataraga', village: 'Buhanga', role: 'dancer', status: 'active' },
      { memberId: 'URJ-2024-0005', fullName: 'Eric Ngabonziza', gender: 'male', dateOfBirth: new Date('1996-09-30'), phoneNumber: '+250788100005', emailAddress: 'eric@example.com', province: 'Western', district: 'Rubavu', sector: 'Gisenyi', cell: 'Umuganda', village: 'Rwintare', role: 'singer', status: 'active' },
      { memberId: 'URJ-2024-0006', fullName: 'Diane Nyiransabimana', gender: 'female', dateOfBirth: new Date('1999-04-18'), phoneNumber: '+250788100006', province: 'Southern', district: 'Huye', sector: 'Tumba', cell: 'Gitwe', village: 'Rusatira', role: 'drummer', status: 'active' },
      { memberId: 'URJ-2024-0007', fullName: 'Emmanuel Bakundukize', gender: 'male', dateOfBirth: new Date('1994-12-25'), phoneNumber: '+250788100007', province: 'Kigali', district: 'Kicukiro', sector: 'Kagarama', cell: 'Nyanza', village: 'Rwezamenyo', role: 'dancer', status: 'inactive' },
      { memberId: 'URJ-2024-0008', fullName: 'Gloria Uwase', gender: 'female', dateOfBirth: new Date('2001-06-14'), phoneNumber: '+250788100008', emailAddress: 'gloria@example.com', province: 'Eastern', district: 'Rwamagana', sector: 'Kigabiro', cell: 'Muyumbu', village: 'Kamate', role: 'singer', status: 'active' }
    ];

    const members = await Member.insertMany(membersData);

    console.log('Seeding attendance...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const attendanceData = members.slice(0, 6).map(m => ({
      member: m._id,
      date: today,
      status: 'present',
      recordedBy: admin._id
    }));

    attendanceData.push({
      member: members[6]._id,
      date: today,
      status: 'absent',
      recordedBy: admin._id
    });

    await Attendance.insertMany(attendanceData);

    const yesterdayAttendance = members.slice(0, 5).map(m => ({
      member: m._id,
      date: yesterday,
      status: 'present',
      recordedBy: admin._id
    }));
    yesterdayAttendance.push({
      member: members[5]._id,
      date: yesterday,
      status: 'late',
      recordedBy: admin._id
    });
    yesterdayAttendance.push({
      member: members[6]._id,
      date: yesterday,
      status: 'absent',
      recordedBy: admin._id
    });

    await Attendance.insertMany(yesterdayAttendance);

    console.log('\n--- Seed Complete ---');
    console.log('Admin: admin@urujeni.com / admin123');
    console.log('Manager: manager@urujeni.com / manager123');
    console.log('---------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
