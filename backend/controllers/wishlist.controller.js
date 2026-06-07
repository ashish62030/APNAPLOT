import Wishlist from "../models/wishlist.model.js";

// ADD
export const addWishlist = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    // Check if already exists
    const existing = await Wishlist.findOne({
      user: req.user._id,
      property: propertyId
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Already in wishlist"
      });
    }

    await Wishlist.create({
      user: req.user._id,
      property: propertyId,
    });

    res.status(201).json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET
export const getWishlist = async (req, res) => {
  try {
    const data = await Wishlist.find({
      user: req.user._id,
    }).populate("property");

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// REMOVE
export const removeWishlist = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const result = await Wishlist.findOneAndDelete({
      user: req.user._id,
      property: propertyId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
