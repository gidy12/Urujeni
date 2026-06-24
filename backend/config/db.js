const mongoose = require('mongoose');

const connectDB = async () => {
  while (mongoose.connection.readyState !== 1) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection failed: ${error.message}. Retrying in 5s...`);
      const conn = mongoose.connection;
      conn.on('error', () => {});
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;
