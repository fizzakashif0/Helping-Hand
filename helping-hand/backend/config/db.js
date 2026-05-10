
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not set in environment (.env)");
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log("MongoDB Connected:", conn.connection.host);
  } catch (error) {
    console.error("DB ERROR:", error.message);
    throw error; // fail fast
  }
};

module.exports = connectDB;

