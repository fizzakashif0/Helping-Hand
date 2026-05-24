const express = require("express");
const router = express.Router();

const usersController = require("./controller");
const { verifyToken } = require("../../shared/authMiddleware");

// My profile (protected)
router.get("/profile", verifyToken, usersController.getMyProfile);
router.put("/profile", verifyToken, usersController.updateProfile);
router.post("/profile/picture", verifyToken, usersController.uploadProfilePicture);

// Public profile (still protected as requested)
router.get("/:id", verifyToken, usersController.getPublicProfile);

module.exports = router;



