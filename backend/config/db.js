
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("ENV:", process.env.MONGO_URI); // 👈 ADD THIS

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("DB ERROR:", error.message);
  }
};

module.exports = connectDB;

