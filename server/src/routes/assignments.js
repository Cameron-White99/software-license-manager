import { Router } from "express";
import {
  listMyAssignments,
  listAssignments,
  revokeAssignment,
} from "../controllers/assignmentController.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

// R4: User views their own active license assignments.
// Literal paths stay above any /:id route - Express matches in registration
// order, so "mine" would otherwise be captured as an id (see R4).
router.get("/mine", requireRole("User"), listMyAssignments);

// R5: Admin views all active assignments, optionally filtered by ?licenseId=
router.get("/", requireRole("Admin"), listAssignments);

// R6: Admin revokes an active assignment. Registered after the literal
// /mine path above, per the R4 ordering note.
router.patch("/:id/revoke", requireRole("Admin"), revokeAssignment);

// Next up: GET /mine/history (R8)

export default router;
