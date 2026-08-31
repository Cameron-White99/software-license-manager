import { Router } from "express";
import { createRequest } from "../controllers/requestController.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

// R1: User submits a license request
router.post("/", requireRole("User"), createRequest);

// Next up: GET / (R2 — Admin pending queue), GET /mine (R4 — User dashboard),
// PATCH /:id/approve (R3 — approve & assign)

export default router;
