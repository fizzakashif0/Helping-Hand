const express = require('express');

const authController = require('./controller');

const router = express.Router();

const { verifyToken } = require('../../shared/authMiddleware');
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/login-admin', authController.loginAdmin);
router.post('/register-ngo', authController.registerNGO);   
router.post('/login-ngo', authController.loginNGO); 
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/google-login', authController.googleLogin);
router.get('/verify-email', authController.verifyEmailGet);
router.post('/verify-email', authController.verifyEmailPost);
router.post('/resend-verification', authController.resendVerification);

// GET /api/auth/me — get current logged-in user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const User = require('./model');
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

