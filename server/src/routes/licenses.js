import { Router } from "express";
import { createLicense, listLicenses } from "../controllers/licenseController.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

// R2b: Admin adds a license to inventory
router.post("/", requireRole("Admin"), createLicense);

// Supports R2/R3 and R2b's own list view
router.get("/", requireRole("Admin"), listLicenses);

export default router;
