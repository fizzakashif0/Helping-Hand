develop
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("ENV:", process.env.MONGO_URI); // 👈 ADD THIS

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("DB ERROR:", error.message);

const mongoose= require ('mongoose');
const connectDB= async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
main
    process.exit(1);
  }
};

 develop
module.exports = connectDB;
=======
module.exports = connectDB;
main
