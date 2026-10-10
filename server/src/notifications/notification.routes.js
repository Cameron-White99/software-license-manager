import { Router } from "express";
import { listForUser } from "./NotificationService.js";
import { asyncHandler } from "../middleware/ErrorMiddleware.js";
import { protect } from "../middleware/AuthMiddleware.js";

const router = Router();

router.get("/", protect, asyncHandler(async (req, res) => {
  const data = await listForUser(req.user._id);
  return res.status(200).json(data);
}));

export default router;
