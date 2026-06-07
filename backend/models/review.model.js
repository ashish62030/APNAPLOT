import mongoose from "mongoose";

// Stores one buyer rating for one property.
const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 800,
    },
  },
  { timestamps: true }
);

// Prevents the same buyer from creating multiple separate ratings for one property.
reviewSchema.index({ property: 1, buyer: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
