const express = require('express');

const { verifyToken } = require('../../shared/authMiddleware');
const usersController = require('./controller');

const router = express.Router();

router.patch('/select-role', verifyToken, usersController.selectRole);
router.patch('/update-profile', verifyToken, usersController.updateProfile);
router.get('/profile', verifyToken, usersController.getProfile);
router.get('/:id/trust-score', verifyToken, usersController.getTrustScore);

module.exports = router;


