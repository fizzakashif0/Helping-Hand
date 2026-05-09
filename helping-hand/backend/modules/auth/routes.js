const express = require("express");
const router = express.Router();

const authController = require("./controller");
const { verifyJWT, requireRole } = require("../../shared/authMiddleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/me", verifyJWT, authController.me);

// Example role-guard endpoint
router.get("/admin-only", verifyJWT, requireRole(["admin"]), (req, res) => {
  res.json({ ok: true, role: req.user.role });
});

module.exports = router;

