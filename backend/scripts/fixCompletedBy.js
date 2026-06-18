const mongoose = require("mongoose");

async function fix() {
  await mongoose.connect("mongodb://localhost:27017/helping-hand");
  
  const result = await mongoose.connection.collection("chatthreads").updateMany(
    { completedBy: { $not: { $type: "array" } } },
    { $set: { completedBy: [] } }
  );
  
  console.log("Fixed:", result.modifiedCount, "documents");
  await mongoose.disconnect();
}

fix();