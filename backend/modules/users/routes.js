const express = require("express");
const router = express.Router();

const usersController = require("./controller");
const { verifyJWT, requireRole } = require("../../shared/authMiddleware");

router.get("/:userId", verifyJWT, requireRole(["admin", "ngo", "donor", "recipient"]), usersController.getUserById);

router.put("/me", verifyJWT, usersController.updateMe);

module.exports = router;

