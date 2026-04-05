const Donation = require("./donation.model");

exports.createDonation = async (req, res) => {
  try {
    const donation = await Donation.create({
      donor: req.body.donor,
      type: req.body.type,
      description: req.body.description,
      quantity: req.body.quantity,
      location: req.body.location,
      images: req.body.images,
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};