const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.get("/", controller.listForUser);
router.get("/unread-count", controller.unreadCount);
router.patch("/read", controller.markRead);

module.exports = router;
