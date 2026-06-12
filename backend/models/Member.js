const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  memberId: {
    type: String,
    unique: true,
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [150, 'Name cannot exceed 150 characters']
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Gender is required']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  emailAddress: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  nationalId: {
    type: String,
    trim: true
  },
  province: {
    type: String,
    required: [true, 'Province is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  sector: {
    type: String,
    required: [true, 'Sector is required'],
    trim: true
  },
  cell: {
    type: String,
    required: [true, 'Cell is required'],
    trim: true
  },
  village: {
    type: String,
    required: [true, 'Village is required'],
    trim: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['dancer', 'drummer', 'singer'],
    required: [true, 'Role is required'],
    default: 'dancer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  profilePhoto: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

memberSchema.index({ fullName: 'text', province: 1, district: 1, status: 1 });

module.exports = mongoose.model('Member', memberSchema);
