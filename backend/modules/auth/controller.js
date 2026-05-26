const authService = require('./service');

function asyncHandler(fn) {
  return (req, res) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      const status = err.statusCode || 500;
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
  const { googleId, email, name, profilePicture } = req.body || {};
  const missing = requireFields({ googleId, email, name }, ['googleId', 'email', 'name']);
  if (missing) return res.status(400).json({ message: `${missing} is required` });

  const result = await authService.googleLogin({
    googleId,
    email,
    name,
    profilePicture,
  });

  return res.status(200).json(result);
});

