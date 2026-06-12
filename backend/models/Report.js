const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'annual', 'members', 'location', 'gender'],
    required: [true, 'Report type is required']
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateRange: {
    start: { type: Date },
    end: { type: Date }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  filePath: {
    type: String,
    default: null
  },
  format: {
    type: String,
    enum: ['pdf', 'excel', 'json'],
    default: 'json'
  }
}, {
  timestamps: true
});

reportSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
