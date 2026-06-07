import express from "express";
import {
  createPropertyReview,
  deletePropertyReview,
  getPropertyReviews,
} from "../controllers/review.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const reviewRouter = express.Router();

// Rating routes used by the property details page.
reviewRouter.get("/property/:propertyId", getPropertyReviews);
reviewRouter.post("/", protect, createPropertyReview);
reviewRouter.delete("/:reviewId", protect, deletePropertyReview);

export default reviewRouter;
