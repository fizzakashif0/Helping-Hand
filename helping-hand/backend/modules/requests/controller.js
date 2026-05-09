const Request = require("./model");
const Donation = require("../donations/model");
const mongoose = require("mongoose");
const crypto = require("crypto");

// Helper function to convert string IDs to valid MongoDB ObjectIds
function convertToObjectId(stringId) {
  if (!stringId) return null;
  
  if (mongoose.Types.ObjectId.isValid(stringId)) {
    return stringId;
  }
  
  // For demo/string IDs, generate a consistent hex string that looks like an ObjectId
  const hash = crypto.createHash("md5").update(stringId).digest("hex").substring(0, 24);
  return hash;
}

const DEFAULT_BROWSE_RADIUS_KM = 50;

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(fromLat, fromLng, toLat, toLng) {
  const earthRadiusKm = 6371;
  const latDistance = toRadians(toLat - fromLat);
  const lngDistance = toRadians(toLng - fromLng);

  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

// Create a new help request
exports.createRequest = async (req, res) => {
  try {
    const requesterId = req.body.userId || req.body.requester;
    const validRequesterId = convertToObjectId(requesterId);

    const requestData = {
      requester: validRequesterId,
      postType: "request",
      type: req.body.type,
      message: req.body.message || req.body.description,
      quantityText: req.body.quantityText || req.body.quantity || "Not specified",
      location: req.body.location,
      urgency: req.body.urgency || "low",
      status: "pending",
    };

    const request = await Request.create(requestData);
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ postType: "request" })
      .populate("requester", "name email phone")
      .populate("donation")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get requests by a specific requester
exports.getRequestsByRequester = async (req, res) => {
  try {
    const { requesterId } = req.params;
    if (!requesterId) return res.status(400).json({ message: "requesterId is required" });

    const validRequesterId = convertToObjectId(requesterId);
    const requests = await Request.find({ requester: validRequesterId, postType: "request" })
      .populate("donation")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get nearby requests within a radius (for donors to find requests near them)
exports.getNearbyRequests = async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = DEFAULT_BROWSE_RADIUS_KM } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistanceKm = parseFloat(radius) || DEFAULT_BROWSE_RADIUS_KM;

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ message: "lat and lng must be valid numbers" });
    }

    const allRequests = await Request.find({ postType: "request", status: "pending" })
      .populate("requester", "name email phone")
      .sort({ createdAt: -1 });

    const nearbyRequests = allRequests.filter((request) => {
      const requestLat = request.location?.coordinates?.lat;
      const requestLng = request.location?.coordinates?.lng;

      if (typeof requestLat !== "number" || typeof requestLng !== "number") {
        return false;
      }

      const distanceKm = calculateDistanceKm(latitude, longitude, requestLat, requestLng);
      return distanceKm <= maxDistanceKm;
    });

    res.json(nearbyRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get available donations for a request (match by type)
exports.getAvailableDonations = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { status: "available", postType: "donation" };

    if (type) {
      query.type = type;
    }

    const donations = await Donation.find(query)
      .populate("donor", "name email phone")
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply for a donation (link request to donation)
exports.applyForDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { requestId } = req.body;

    if (!requestId || !donationId) {
      return res.status(400).json({ message: "requestId and donationId are required" });
    }

    // Find the request and donation
    const request = await Request.findById(requestId);
    const donation = await Donation.findById(donationId);

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // Check if types match
    if (request.type !== donation.type) {
      return res.status(400).json({
        message: `Request type (${request.type}) does not match donation type (${donation.type})`,
      });
    }

    // Link donation to request and update status
    request.donation = donationId;
    request.status = "approved";
    await request.save();

    // Update donation status
    donation.status = "matched";
    await donation.save();

    res.json({
      message: "Successfully applied for donation",
      request,
      donation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update request status (admin/system)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "approved", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
