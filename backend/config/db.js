const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI
      .replace('mongodb+srv://', 'mongodb://')
      .replace('cluster0.92cusiy.mongodb.net', 'ac-cofrr5j-shard-00-00.92cusiy.mongodb.net:27017,ac-cofrr5j-shard-00-01.92cusiy.mongodb.net:27017,ac-cofrr5j-shard-00-02.92cusiy.mongodb.net:27017');
    const conn = await mongoose.connect(uri, {
      ssl: true,
      tlsInsecure: true,
      replicaSet: 'atlas-9ywhqd-shard-0',
      authSource: 'admin',
      retryWrites: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
