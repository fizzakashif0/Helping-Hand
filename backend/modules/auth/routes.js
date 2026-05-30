const express = require('express');

const authController = require('./controller');

const router = express.Router();

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

module.exports = router;

