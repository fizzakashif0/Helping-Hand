const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(password, hashed) {
  return bcrypt.compare(password, hashed);
}

module.exports = { hashPassword, comparePassword };

