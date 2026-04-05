const Donation = require("./model");

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

async function findBrowseableDonations({ lat, lng, radiusKm = DEFAULT_BROWSE_RADIUS_KM } = {}) {
  const baseQuery = {
    postType: "donation",
  };

  const donations = await Donation.find(baseQuery).sort({ createdAt: -1 });

  if (lat === undefined || lng === undefined) {
    return donations;
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const maxDistanceKm = parseFloat(radiusKm) || DEFAULT_BROWSE_RADIUS_KM;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    const error = new Error("lat and lng must be valid numbers");
    error.statusCode = 400;
    throw error;
  }

  return donations.filter((donation) => {
    const donationLat = donation.location?.coordinates?.lat;
    const donationLng = donation.location?.coordinates?.lng;

    if (typeof donationLat !== "number" || typeof donationLng !== "number") {
      return false;
    }

    const distanceKm = calculateDistanceKm(latitude, longitude, donationLat, donationLng);
    return distanceKm <= maxDistanceKm;
  });
}

exports.createDonation = async (req, res) => {
  try {
    // Prepare donation data, handling quantity as string
    const donationData = {
      donor: req.body.userId || req.body.donor,
      type: req.body.type,
      postType: "donation",
      description: req.body.description,
      quantityText: req.body.quantityText || req.body.quantity || "Not specified", // Use quantityText field
      location: req.body.location,
      images: req.body.images,
      status: "pending",
      expiryTime: req.body.expiryTime,
    };

    const donation = await Donation.create(donationData);

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyDonations = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.donorId;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const donations = await Donation.find({ donor: userId, postType: "donation" }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNearbyDonationsByQuery = async (req, res) => {
  try {
    const { lat, lng, radius = DEFAULT_BROWSE_RADIUS_KM } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "lat and lng are required" });

    const donations = await findBrowseableDonations({
      lat,
      lng,
      radiusKm: radius,
    });

    res.json(donations);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAvailableDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "available" }).sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBrowseableDonations = async (req, res) => {
  try {
    const { lat, lng, radius = DEFAULT_BROWSE_RADIUS_KM } = req.query;

    const donations = await findBrowseableDonations({
      lat,
      lng,
      radiusKm: radius,
    });

    res.json(donations);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getDonationsByDonor = async (req, res) => {
  try {
    const { donorId } = req.params;
    const { status } = req.query;
    const query = { donor: donorId };
    if (status) query.status = status;

    const donations = await Donation.find(query).sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNearbyDonations = async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const donations = await findBrowseableDonations({
      lat,
      lng,
      radiusKm: DEFAULT_BROWSE_RADIUS_KM,
    });

    res.json(donations);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.updateDonationStatus = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status } = req.body;
    const donation = await Donation.findByIdAndUpdate(donationId, { status }, { new: true });
    res.json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.findBrowseableDonations = findBrowseableDonations;
