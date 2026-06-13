// backend/scripts/resetAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const User = require('../modules/auth/model');
const { hashPassword } = require('../utils/hashPassword');

async function resetAdmin() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/helping-hand');

  const hashed = await hashPassword('admin123');

  const result = await User.findOneAndUpdate(
    { email: 'admin@helpinghand.com' },
    { password: hashed, role: 'admin', isVerified: true },
    { new: true, upsert: true }
  );

  console.log('✅ Admin password reset: admin@helpinghand.com / admin123');
  process.exit(0);
}

resetAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});