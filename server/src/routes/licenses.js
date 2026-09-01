import { Router } from "express";
import {
  createLicense,
  listLicenses,
  listAvailableLicenses,
} from "../controllers/licenseController.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

// R2b: Admin adds a license to inventory
router.post("/", requireRole("Admin"), createLicense);

// R1 (dropdown fix): User-facing product list for the Submit Request
// dropdown. Literal path, registered above the Admin root route; it exposes
// only productName + seatsAvailable, never full license records.
router.get("/available", requireRole("User"), listAvailableLicenses);

// Supports R2/R3 and R2b's own list view
router.get("/", requireRole("Admin"), listLicenses);

export default router;
