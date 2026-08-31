import { Router } from "express";
import { listMyAssignments } from "../controllers/assignmentController.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

// R4: User views their own active license assignments
router.get("/mine", requireRole("User"), listMyAssignments);

// Next up: GET / (R5 — Admin active assignments), PATCH /:id/revoke (R6/R7)

export default router;
