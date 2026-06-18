const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.post("/", controller.createDonationRequest);
router.get("/donor/:donorId", controller.listForDonor);
router.get("/recipient/:recipientId", controller.listForRecipient);
router.patch("/:requestId/status", controller.updateDonationRequestStatus);

module.exports = router;
