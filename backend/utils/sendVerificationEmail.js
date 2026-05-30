const nodemailer = require('nodemailer');

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

function getPublicApiBaseUrl() {
  return (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
}

async function sendVerificationEmail({ toEmail, name, verificationToken }) {
  const transporter = createTransporter();
  const baseUrl = getPublicApiBaseUrl();
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`;
  const appDeepLink = `helpinghand://verify-email?token=${encodeURIComponent(verificationToken)}`;

  if (!transporter) {
    console.warn('[auth] EMAIL_USER/EMAIL_PASS not configured — verification email not sent');
    return { sent: false, verifyUrl, appDeepLink };
  }

  const displayName = name || 'there';

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Helping Hand — Verify your email',
    text: [
      `Hi ${displayName},`,
      '',
      'Thanks for signing up for Helping Hand. Please verify your email address:',
      '',
      verifyUrl,
      '',
      'Or open this link in the app:',
      appDeepLink,
      '',
      'This link expires in 24 hours.',
      '',
      'If you did not create an account, you can ignore this email.',
    ].join('\n'),
    html: `
      <p>Hi ${displayName},</p>
      <p>Thanks for signing up for <strong>Helping Hand</strong>. Please verify your email:</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>Or open in the app: <a href="${appDeepLink}">${appDeepLink}</a></p>
      <p><small>This link expires in 24 hours.</small></p>
    `,
  });

  return { sent: true, verifyUrl, appDeepLink };
}

module.exports = sendVerificationEmail;
