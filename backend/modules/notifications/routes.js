const express = require("express");
const router = express.Router();
const controller = require("./controller");
const authenticate = require("../../middleware/authenticate");

router.get("/", authenticate, controller.listForUser);
router.get("/unread-count", authenticate, controller.unreadCount);
router.patch("/read", authenticate, controller.markRead);

module.exports = router;
