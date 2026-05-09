const Donation = require("./model");
const mongoose = require("mongoose");
const crypto = require("crypto");

function convertToObjectId(stringId) {
  if (!stringId) return null;

  if (mongoose.Types.ObjectId.isValid(stringId)) {
    return stringId;
  }

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

function setLocationGeoFromBody(location) {
  if (!location || !location.coordinates) return undefined;
  const lat = location.coordinates.lat;
  const lng = location.coordinates.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return undefined;
  if (Number.isNaN(lat) || Number.isNaN(lng)) return undefined;
  return {
    type: "Point",
    coordinates: [lng, lat],
  };
}

function toPublicDonation(doc, distanceKm) {
  const d = doc.toObject ? doc.toObject() : doc;
  const id = d._id?.toString?.() || d._id;
  const desc = d.description || "";
  const title = desc.split("\n")[0]?.trim() || "Donation";
  const rest = desc.split("\n").slice(1).join("\n").trim();
  const shortDescription = (rest || desc).slice(0, 220);

  const landmark =
    d.location?.landmark ||
    d.location?.areaName ||
    d.location?.address ||
    "General area";

  const postedAt = d.createdAt || d.postedAt;

  const out = {
    _id: id,
    type: d.type,
    title,
    shortDescription,
    landmark,
    quantityText: d.quantityText,
    images: d.images || [],
    postedAt,
    createdAt: postedAt,
  };

  if (distanceKm != null && !Number.isNaN(distanceKm)) {
    out.distanceKm = Math.round(distanceKm * 10) / 10;
  }

  return out;
}

async function findBrowseableDonations({ lat, lng, radiusKm = DEFAULT_BROWSE_RADIUS_KM } = {}) {
  const statusFilter = { $in: ["pending", "available"] };
  const baseQuery = {
    postType: "donation",
    status: statusFilter,
  };

  const hasCoords =
    lat != null &&
    lng != null &&
    !Number.isNaN(parseFloat(lat)) &&
    !Number.isNaN(parseFloat(lng));

  if (!hasCoords) {
    return Donation.find(baseQuery).sort({ createdAt: -1 }).lean();
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const maxKm = parseFloat(radiusKm) || DEFAULT_BROWSE_RADIUS_KM;
  const maxMeters = maxKm * 1000;

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    const error = new Error("lat and lng must be valid numbers");
    error.statusCode = 400;
    throw error;
  }

  try {
    const geoResults = await Donation.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          maxDistance: maxMeters,
          spherical: true,
          query: {
            postType: "donation",
            status: statusFilter,
            "locationGeo.coordinates.0": { $exists: true },
          },
        },
      },
      { $sort: { distance: 1 } },
    ]);

    if (geoResults.length > 0) {
      return geoResults.map((d) => ({
        ...d,
        distanceKm: d.distance / 1000,
      }));
    }
  } catch (err) {
    console.warn("Donation $geoNear failed, using legacy distance filter:", err.message);
  }

  const donations = await Donation.find(baseQuery).lean();

  return donations
    .map((d) => {
      const dLat = d.location?.coordinates?.lat;
      const dLng = d.location?.coordinates?.lng;
      if (typeof dLat !== "number" || typeof dLng !== "number") return null;
      const distanceKm = calculateDistanceKm(latitude, longitude, dLat, dLng);
      if (distanceKm > maxKm) return null;
      return { ...d, distanceKm };
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

exports.createDonation = async (req, res) => {
  try {
    const body = req.body || {};
    const donorId = body.userId || body.donor;
    const validDonorId = convertToObjectId(donorId);

    const loc = body.location || {};
    const locationGeo = setLocationGeoFromBody(loc);

    const donationData = {
      donor: validDonorId,
      type: body.type,
      postType: "donation",
      description: body.description,
      quantityText: body.quantityText || body.quantity || "Not specified",
      location: {
        landmark: loc.landmark,
        areaName: loc.areaName,
        fullAddress: loc.fullAddress,
        address: loc.fullAddress || loc.address,
        coordinates: loc.coordinates,
      },
      images: body.images,
      status: body.status || "available",
      expiryTime: body.expiryTime,
      locationGeo,
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

    const validUserId = convertToObjectId(userId);
    const donations = await Donation.find({ donor: validUserId, postType: "donation" }).sort({
      createdAt: -1,
    });
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

    const payload = donations.map((d) => toPublicDonation(d, d.distanceKm));
    res.json(payload);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAvailableDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      postType: "donation",
      status: { $in: ["pending", "available"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    const payload = donations.map((d) => toPublicDonation(d, undefined));
    res.json(payload);
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

    const payload = donations.map((d) => toPublicDonation(d, d.distanceKm));
    res.json(payload);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getDonationsByDonor = async (req, res) => {
  try {
    const { donorId } = req.params;
    const { status } = req.query;

    const validDonorId = convertToObjectId(donorId);
    const query = { donor: validDonorId };
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

    const payload = donations.map((d) => toPublicDonation(d, d.distanceKm));
    res.json(payload);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getPublicDonationById = async (req, res) => {
  try {
    const { donationId } = req.params;
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.json(toPublicDonation(donation, undefined));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDonationStatus = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status } = req.body || {};
    const donation = await Donation.findByIdAndUpdate(donationId, { status }, { new: true });
    res.json(donation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.findBrowseableDonations = findBrowseableDonations;
exports.toPublicDonation = toPublicDonation;
