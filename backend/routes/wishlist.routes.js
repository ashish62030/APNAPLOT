import express from "express";

import {
  addWishlist,
  getWishlist,
  removeWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const wishlistRouter = express.Router();

wishlistRouter.post("/:propertyId", protect, addWishlist);
wishlistRouter.get("/", protect, getWishlist);
wishlistRouter.delete("/:propertyId", protect, removeWishlist);

export default wishlistRouter;