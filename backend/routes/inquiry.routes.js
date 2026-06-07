import express from "express";
const inquiryRouter = express.Router();
import {
    sendInquiry,
    getSellerInquiries,
    markAsRead,
} from "../controllers/inquiry.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

inquiryRouter.post("/", protect, authorize("buyer"), sendInquiry);
inquiryRouter.get("/seller", protect, authorize("seller"), getSellerInquiries);
inquiryRouter.patch("/:id/read", protect, markAsRead);

export default inquiryRouter;
