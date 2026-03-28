const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables!");
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    // If the DB fails, we want the app to stop so we can fix it
    process.exit(1); 
  }
};

module.exports = connectDB;
