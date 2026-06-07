import mongoose from "mongoose";
import Property from "../models/property.model.js";
import Review from "../models/review.model.js";

// Recalculates the average rating and total reviews after save/delete.
const buildReviewSummary = async (propertyId) => {
  const propertyObjectId = new mongoose.Types.ObjectId(propertyId);
  const stats = await Review.aggregate([
    { $match: { property: propertyObjectId } },
    {
      $group: {
        _id: "$property",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  return {
    averageRating: stats[0]?.averageRating || 0,
    reviewCount: stats[0]?.reviewCount || 0,
  };
};

export const getPropertyReviews = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    // Public listing of all reviews for a property.
    const reviews = await Review.find({ property: propertyId })
      .populate("buyer", "name profilePic")
      .sort({ createdAt: -1 });
    const summary = await buildReviewSummary(propertyId);

    res.json({
      success: true,
      reviews,
      ...summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createPropertyReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!propertyId || !numericRating) {
      return res.status(400).json({
        success: false,
        message: "Property and rating are required",
      });
    }

    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (req.user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can submit ratings",
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.seller.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot rate your own property",
      });
    }

    // If this buyer already rated this property, update that rating instead.
    const review = await Review.findOneAndUpdate(
      { property: propertyId, buyer: req.user._id },
      {
        property: propertyId,
        seller: property.seller,
        buyer: req.user._id,
        rating: numericRating,
        comment: comment || "",
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).populate("buyer", "name profilePic");

    const summary = await buildReviewSummary(property._id);

    res.status(201).json({
      success: true,
      message: "Rating saved successfully",
      review,
      ...summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePropertyReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    const isOwner = review.buyer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    // Buyers can delete their own rating; admins can delete any rating.
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this rating",
      });
    }

    const propertyId = review.property;
    await review.deleteOne();
    const summary = await buildReviewSummary(propertyId);

    res.json({
      success: true,
      message: "Rating deleted successfully",
      ...summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
