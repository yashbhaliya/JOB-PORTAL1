const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.6cj2rkn.mongodb.net/jobPortal?retryWrites=true&w=majority';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('✅ MongoDB connected successfully!');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    isConnected = false;
  }
};

connectDB();

module.exports = { mongoose, connectDB };
