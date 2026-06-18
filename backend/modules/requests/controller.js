const Request = require("./model");
const Donation = require("../donations/model");
const mongoose = require("mongoose");
const { setLocationGeoFromBody, calculateDistanceKm, DEFAULT_BROWSE_RADIUS_KM } = require("../../shared/geospatial");

// Create a new help request
exports.createRequest = async (req, res) => {
  try {
    const body = req.body || {};
    const requesterId = req.user?.id;
    if (!requesterId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const loc = body.location || {};
    const locationGeo = setLocationGeoFromBody(loc);

    const requestData = {
      requester: requesterId,
      postType: "request",
      type: body.type,
      message: body.message || body.description,
      quantityText: body.quantityText || body.quantity || "Not specified",
      location: {
        landmark: loc.landmark,
        areaName: loc.areaName,
        fullAddress: loc.fullAddress,
        address: loc.address || loc.fullAddress,
        coordinates: loc.coordinates,
      },
      locationGeo,
      urgency: body.urgency || "low",
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

    const requests = await Request.find({ requester: requesterId, postType: "request" })
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
    const maxKm = parseFloat(radius) || DEFAULT_BROWSE_RADIUS_KM;
    const maxMeters = maxKm * 1000;

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return res.status(400).json({ message: "lat and lng must be valid numbers" });
    }

    try {
      // Try $geoNear aggregation first (efficient with geospatial index)
      const geoResults = await Request.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [longitude, latitude] },
            distanceField: "distance",
            maxDistance: maxMeters,
            spherical: true,
            query: {
              postType: "request",
              status: "pending",
              "locationGeo.coordinates.0": { $exists: true },
            },
          },
        },
        { $sort: { distance: 1 } },
      ]);

      if (geoResults.length > 0) {
        return res.json(geoResults.map((r) => ({
          ...r,
          distanceKm: r.distance / 1000,
        })));
      }
    } catch (err) {
      console.warn("Request $geoNear failed, using legacy distance filter:", err.message);
    }

    // Fallback: manual filtering for requests without locationGeo
    const allRequests = await Request.find({ postType: "request", status: "pending" })
      .populate("requester", "name email phone")
      .sort({ createdAt: -1 });

    const nearbyRequests = allRequests
      .map((request) => {
        const requestLat = request.location?.coordinates?.lat;
        const requestLng = request.location?.coordinates?.lng;
        if (typeof requestLat !== "number" || typeof requestLng !== "number") return null;
        
        const distanceKm = calculateDistanceKm(latitude, longitude, requestLat, requestLng);
        if (distanceKm > maxKm) return null;
        
        return { ...request.toObject(), distanceKm };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm);

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
    const { requestId } = req.body || {};

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
    const { status } = req.body || {};

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
