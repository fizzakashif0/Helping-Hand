const express = require('express');

const authController = require('./controller');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/register-ngo', authController.registerNGO);   
router.post('/login-ngo', authController.loginNGO); 
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/google-login', authController.googleLogin);

module.exports = router;

