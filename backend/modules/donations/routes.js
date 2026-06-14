const express = require("express");
const router = express.Router();
const donationController = require("./controller");
const requestController = require("../requests/controller");
const authenticate = require("../../middleware/authenticate");

router.post("/", authenticate, donationController.createDonation);
router.get("/", donationController.getAvailableDonations);
router.get("/browse", donationController.getBrowseableDonations);
router.get("/donor/:donorId", donationController.getDonationsByDonor);
router.get("/nearby/:lat/:lng", donationController.getNearbyDonations);
router.get("/:donationId/public", donationController.getPublicDonationById);
router.put("/:donationId", donationController.updateDonationStatus);

// Backward-compatible alias for request listing from donations routes
router.get("/requests", requestController.getAllRequests);

module.exports = router;
