import { Router } from "express";
import {
  createRequest,
  listRequests,
  getRequest,
  approveRequest,
  rejectRequest,
} from "../controllers/requestController.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

// R1: User submits a license request
router.post("/", requireRole("User"), createRequest);

// R2: Admin views the request queue, optionally filtered by ?status=
router.get("/", requireRole("Admin"), listRequests);

// R3: Admin opens a single request to action it
router.get("/:id", requireRole("Admin"), getRequest);

// R3: Admin approves (assigning a seat) or rejects a pending request
router.patch("/:id/approve", requireRole("Admin"), approveRequest);
router.patch("/:id/reject", requireRole("Admin"), rejectRequest);

// Next up: GET /mine (R4 — User dashboard)

export default router;
