import { Router } from "express";
import { createRequest, listRequests } from "../controllers/requestController.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

// R1: User submits a license request
router.post("/", requireRole("User"), createRequest);

// R2: Admin views the request queue, optionally filtered by ?status=
router.get("/", requireRole("Admin"), listRequests);

// Next up: GET /mine (R4 — User dashboard), PATCH /:id/approve (R3 — approve & assign)

export default router;
