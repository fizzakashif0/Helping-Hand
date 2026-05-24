const express = require("express");
const router = express.Router();

const authController = require("./controller");
const { verifyJWT, requireRole } = require("../../shared/authMiddleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/me", verifyJWT, authController.me);

module.exports = router;


