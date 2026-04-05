const Request = require("./model");
const Donation = require("../donations/model");
const donationController = require("../donations/controller");

const DEFAULT_REQUEST_RADIUS_KM = 50;

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

async function findNearbyRequests({ lat, lng, radiusKm = DEFAULT_REQUEST_RADIUS_KM } = {}) {
  const requests = await Request.find({ postType: "request" }).sort({ createdAt: -1 });

  if (lat === undefined || lng === undefined) {
    return requests;
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const maxDistanceKm = parseFloat(radiusKm) || DEFAULT_REQUEST_RADIUS_KM;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    const error = new Error("lat and lng must be valid numbers");
    error.statusCode = 400;
    throw error;
  }

  return requests
    .map((request) => {
      const requestLat = request.location?.coordinates?.lat;
      const requestLng = request.location?.coordinates?.lng;

      if (typeof requestLat !== "number" || typeof requestLng !== "number") {
        return null;
      }

      const distanceKm = calculateDistanceKm(latitude, longitude, requestLat, requestLng);

      if (distanceKm > maxDistanceKm) {
        return null;
      }

      const plainRequest = request.toObject();
      plainRequest.distanceKm = distanceKm;
      return plainRequest;
    })
    .filter(Boolean);
}

exports.createRequest = async (req, res) => {
  try {
    const request = await Request.create({
      requester: req.body.userId || req.body.requester,
      postType: "request",
      donation: req.body.donation,
      type: req.body.type,
      message: req.body.message,
      quantityText: req.body.quantityText || req.body.quantity || "Not specified",
      location: req.body.location,
      urgency: req.body.urgency,
      status: "pending",
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.requesterId;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const requests = await Request.find({ requester: userId, postType: "request" }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNearbyRequestsByQuery = async (req, res) => {
  try {
    const { lat, lng, radius = DEFAULT_REQUEST_RADIUS_KM } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "lat and lng are required" });

    const requests = await findNearbyRequests({
      lat,
      lng,
      radiusKm: radius,
    });

    res.json(requests);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRequestsByRequester = async (req, res) => {
  try {
    const { requesterId } = req.params;
    const requests = await Request.find({ requester: requesterId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNearbyRequests = async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const requests = await findNearbyRequests({
      lat,
      lng,
      radiusKm: DEFAULT_REQUEST_RADIUS_KM,
    });

    res.json(requests);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAvailableDonations = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    const donations = await donationController.findBrowseableDonations({
      lat,
      lng,
      radiusKm: radius,
    });

    res.json(donations);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.applyForDonation = async (req, res) => {
  try {
    const { userId } = req.body;
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    if (!donation.applicants) {
      donation.applicants = [];
    }

    if (donation.applicants.includes(userId)) {
      return res.status(400).json({ error: "You have already applied" });
    }

    donation.applicants.push(userId);
    await donation.save();

    res.json({ message: "Applied successfully", donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findNearbyRequests = findNearbyRequests;
