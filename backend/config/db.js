const mongoose = require('mongoose');

const connectDB = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 60000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB attempt ${i + 1}/${retries}: ${error.message}`);
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  console.log('MongoDB connection failed after all retries. Server running without DB.');
};

module.exports = connectDB;
