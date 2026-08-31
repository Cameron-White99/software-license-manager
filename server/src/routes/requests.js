import { Router } from "express";
import {
  createRequest,
  listRequests,
  listMyRequests,
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

// R4: User views their own requests.
// MUST stay above GET /:id - Express matches in registration order, so
// below it "mine" would be captured as an id and hit the Admin-only route.
router.get("/mine", requireRole("User"), listMyRequests);

// R3: Admin opens a single request to action it
router.get("/:id", requireRole("Admin"), getRequest);

// R3: Admin approves (assigning a seat) or rejects a pending request
router.patch("/:id/approve", requireRole("Admin"), approveRequest);
router.patch("/:id/reject", requireRole("Admin"), rejectRequest);

export default router;
