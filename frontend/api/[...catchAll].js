const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');

const app = express();

let cachedDb = null;
async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;
  try {
    cachedDb = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB Connected: ${cachedDb.connection.host}`);
    return cachedDb;
  } catch (error) {
    console.log(`MongoDB error: ${error.message}`);
    mongoose.connection.close().catch(() => {});
    throw error;
  }
}

const allowedOrigins = [
  'http://localhost:3000',
  'https://urujeni-frontend.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditLogRoutes);

app.get('/api/health', async (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  try {
    await connectDB();
    res.json({ status: 'ok', timestamp: new Date().toISOString(), db: states[mongoose.connection.readyState] || 'unknown' });
  } catch {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), db: states[mongoose.connection.readyState] || 'unknown' });
  }
});

app.use(errorHandler);

module.exports = app;
