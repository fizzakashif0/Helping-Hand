const nodemailer = require('nodemailer');

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

async function sendOtpEmail({ toEmail, otp }) {
  const transporter = createTransporter();

  if (!transporter) {
    return { sent: false, reason: 'EMAIL_USER/EMAIL_PASS not configured' };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Helping Hand - Your OTP Code',
    text: `Your OTP code is: ${otp}. It expires in 10 minutes.`
  });

  return { sent: true };
}

module.exports = sendOtpEmail;

