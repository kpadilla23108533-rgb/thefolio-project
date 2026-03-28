const mongoose = require('mongoose');
const   connectDB=async()=>{
  try{
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDBConnected:${conn.connection.host}`);
}catch(error){
    console.error('Databaseconnection error:', error.message);
    process.exit(1); //Stopthe server if DB fails
}
};
module.exports=connectDB;