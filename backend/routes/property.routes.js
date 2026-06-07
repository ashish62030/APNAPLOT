import express from "express";
const propertyRouter = express.Router();
import upload from "../middlewares/upload.middleware.js";
import {
  addProperty,
  getMyProperties,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getPropertyDetails,
  getSellerDashboard,
  getAllProperties,
  getPropertyCounts,
} from "../controllers/property.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

// PUBLIC ROUTE
propertyRouter.get("/", getAllProperties);

// Only Seller can add property
propertyRouter.post("/", protect, authorize("seller"), upload.array("images", 10), addProperty);
propertyRouter.get("/my", protect, authorize("seller"), getMyProperties);
propertyRouter.put("/:id", protect, authorize("seller"), upload.array("images", 10), updateProperty);
propertyRouter.delete("/:id", protect, authorize("seller"), deleteProperty);
propertyRouter.patch("/:id/status", protect, authorize("seller"), updatePropertyStatus);
propertyRouter.get("/counts", getPropertyCounts);
propertyRouter.get("/:id", getPropertyDetails);
propertyRouter.get("/seller/dashboard", protect, authorize("seller"), getSellerDashboard);

export default propertyRouter;