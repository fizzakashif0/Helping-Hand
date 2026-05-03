const express = require("express");
const router = express.Router();
const donationController = require("./controller");
const requestController = require("../requests/controller");

router.post("/", donationController.createDonation);
router.get("/", donationController.getAvailableDonations);
router.get("/browse", donationController.getBrowseableDonations);
router.get("/donor/:donorId", donationController.getDonationsByDonor);
router.get("/nearby/:lat/:lng", donationController.getNearbyDonations);
router.put("/:donationId", donationController.updateDonationStatus);

// Backward-compatible alias for request listing from donations routes
router.get("/requests", requestController.getAllRequests);

module.exports = router;
