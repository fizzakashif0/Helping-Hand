const express = require("express");
const router = express.Router();
const requestController = require("./controller");

router.post("/", requestController.createRequest);
router.get("/", requestController.getAllRequests);
router.get("/requester/:requesterId", requestController.getRequestsByRequester);
router.get("/nearby/:lat/:lng", requestController.getNearbyRequests);
router.get("/donations", requestController.getAvailableDonations);
router.post("/apply/:donationId", requestController.applyForDonation);

module.exports = router;