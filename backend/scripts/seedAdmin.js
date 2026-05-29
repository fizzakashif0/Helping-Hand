const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' }); // adjust path if your .env is elsewhere

const User = require('../modules/auth/model');
const { hashPassword } = require('../utils/hashPassword');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/helping-hand');

  const existing = await User.findOne({ email: 'admin@helpinghand.com' });
  if (existing) {
    console.log('Admin already exists, skipping.');
    process.exit(0);
  }

  const hashed = await hashPassword('admin123');

  await User.create({
    name:         'Admin',
    email:        'admin@helpinghand.com',
    password:     hashed,
    role:         'admin',
    authProvider: 'local',
    isVerified:   true,
  });

  console.log('✅ Admin created: admin@helpinghand.com / admin123');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});