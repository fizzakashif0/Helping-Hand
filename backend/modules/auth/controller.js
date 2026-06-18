const authService = require('./service');

function asyncHandler(fn) {
  return (req, res) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      const status = err.statusCode || 500;
      console.error('[auth]', err.message || err);
      return res.status(status).json({ message: err.message || 'Server error' });
    });
  };
}

function requireFields(body, fields) {
  for (const f of fields) {
    if (body?.[f] === undefined || body?.[f] === null || body?.[f] === '') {
      return f;
    }
  }
  return null;
}

function verificationHtml({ title, body, success }) {
  const color = success ? '#2D9E7A' : '#DC2626';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Helping Hand</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #1A5F7A; color: #fff; display: flex; min-height: 100vh; align-items: center; justify-content: center; margin: 0; padding: 24px; }
    .card { background: #fff; color: #0F2141; border-radius: 16px; padding: 28px; max-width: 420px; text-align: center; }
    h1 { color: ${color}; font-size: 22px; margin: 0 0 12px; }
    p { line-height: 1.5; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${body}</p>
  </div>
</body>
</html>`;
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  const missing = requireFields({ name, email, password }, ['name', 'email', 'password']);
  if (missing) return res.status(400).json({ message: `${missing} is required` });

  const result = await authService.registerUser({ name, email, password });
  return res.status(201).json(result);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const missing = requireFields({ email, password }, ['email', 'password']);
  if (missing) return res.status(400).json({ message: `${missing} is required` });

  const result = await authService.loginUser({ email, password });
  return res.status(200).json(result);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  const missing = requireFields({ email }, ['email']);
  if (missing) return res.status(400).json({ message: `${missing} is required` });

  const result = await authService.forgotPassword({ email });
  return res.status(200).json(result);
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body || {};
  const missing = requireFields({ email, otp }, ['email', 'otp']);
  if (missing) return res.status(400).json({ message: `${missing} is required` });

  await authService.verifyOtp({ email, otp });
  return res.status(200).json({ success: true });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body || {};
  const missing = requireFields({ email, otp, newPassword }, ['email', 'otp', 'newPassword']);
  if (missing) return res.status(400).json({ message: `${missing} is required` });

  await authService.resetPassword({ email, otp, newPassword });
  return res.status(200).json({ success: true });
});

exports.googleLogin = asyncHandler(async (req, res) => {
  const { idToken, googleId, email, name, profilePicture } = req.body || {};

  if (!idToken) {
    const missing = requireFields({ googleId, email, name }, ['googleId', 'email', 'name']);
    if (missing) {
      return res.status(400).json({ message: 'idToken is required for Google sign-in' });
    }
  }

  const result = await authService.googleLogin({
    idToken,
    googleId,
    email,
    name,
    profilePicture,
  });

  return res.status(200).json(result);
});

exports.verifyEmailGet = async (req, res) => {
  try {
    const token = req.query?.token;
    const result = await authService.verifyEmail(token);
    return res
      .status(200)
      .send(
        verificationHtml({
          title: 'Email verified',
          body: result.message,
          success: true,
        })
      );
  } catch (err) {
    const status = err.statusCode || 400;
    console.error('[auth] verify-email GET:', err.message);
    return res
      .status(status)
      .send(
        verificationHtml({
          title: 'Verification failed',
          body: err.message || 'Invalid or expired verification link',
          success: false,
        })
      );
  }
};

exports.verifyEmailPost = asyncHandler(async (req, res) => {
  const token = req.body?.token || req.query?.token;
  const result = await authService.verifyEmail(token);
  return res.status(200).json(result);
});

exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  const missing = requireFields({ email }, ['email']);
  if (missing) return res.status(400).json({ message: `${missing} is required` });

  const result = await authService.resendVerificationEmail({ email });
  return res.status(200).json(result);
});

exports.registerNGO = asyncHandler(async (req, res) => {
  const { name, email, password, orgName, registrationNumber, orgType, missionStatement, phone, address, website } = req.body || {};

  const missing = requireFields(
    { name, email, password, orgName },
    ['name', 'email', 'password', 'orgName']
  );
  if (missing) return res.status(400).json({ message: `${missing} is required` });

  const result = await authService.registerNGO({
    name,
    email,
    password,
    orgName,
    registrationNumber,
    orgType,
    missionStatement,
    phone,
    address,
    website,
  });

  return res.status(201).json(result);
});

exports.loginNGO = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  const missing = requireFields({ email, password }, ['email', 'password']);
  if (missing) return res.status(400).json({ message: `${missing} is required` });

  const result = await authService.loginNGO({ email, password });
  return res.status(200).json(result);
});

exports.loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  const missing = requireFields({ email, password }, ['email', 'password']);
  if (missing) return res.status(400).json({ message: `${missing} is required` });

  const result = await authService.loginAdmin({ email, password });
  return res.status(200).json(result);
});
