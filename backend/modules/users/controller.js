const { selectRole, updateProfile, getProfile } = require('./service');

function asyncHandler(fn) {
  return (req, res) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      const status = err.statusCode || 500;
      return res.status(status).json({ message: err.message || 'Server error' });
    });
  };
}

exports.selectRole = asyncHandler(async (req, res) => {
  const { role } = req.body || {};
  if (!role) return res.status(400).json({ message: 'role is required' });

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await selectRole({ userId, role });
  return res.status(200).json({ user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await updateProfile({
    userId,
    data: req.body || {},
  });

  return res.status(200).json({ user });
});

exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const user = await getProfile({ userId });
  return res.status(200).json({ user });
});

