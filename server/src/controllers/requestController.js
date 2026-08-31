import mongoose from "mongoose";
import Request from "../models/Request.js";
import User from "../models/User.js";
import { getUserId } from "../middleware/auth.js";

// R1: User submits a license request specifying the product they need.
// Acceptance criteria:
//  - a request cannot be submitted with an empty product field
//  - on submission, status = Pending
//  - userId is persisted so R2 (Admin queue) and R4 (User dashboard) can scope it
export async function createRequest(req, res) {
  try {
    const { productRequested } = req.body;
    const userId = getUserId(req);

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "A valid user id is required." });
    }
    if (!productRequested || !productRequested.trim()) {
      return res.status(400).json({ error: "Product name is required." });
    }

    // Mongoose does not enforce referential integrity on a ref, so a well-formed
    // but nonexistent id would persist a request whose requester populates to null.
    // R2/R3/R4 all read this field, so reject at write time rather than have every
    // downstream view defend against a dangling ref. (PR #1 self-review.)
    if (!(await User.exists({ _id: userId }))) {
      return res.status(400).json({ error: "A valid user id is required." });
    }

    const request = await Request.create({
      userId,
      productRequested: productRequested.trim(),
      status: "Pending",
    });

    return res.status(201).json(request);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "Failed to submit request." });
  }
}

const REQUEST_STATUSES = ["Pending", "Approved", "Rejected"];

// R2: Admin views the request queue.
// Acceptance criteria:
//  - each row shows requester name, product requested, and date submitted
//  - the list can be filtered by status (Pending | Approved | Rejected)
// An absent ?status= returns every status, which is what the frame's "All"
// filter calls. Newest first, matching listLicenses in licenseController.js.
export async function listRequests(req, res) {
  try {
    const { status } = req.query;

    if (status && !REQUEST_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${REQUEST_STATUSES.join(", ")}.`,
      });
    }

    const filter = status ? { status } : {};

    // populate the requester so the queue can show a name rather than an id.
    // Safe to rely on: R1 rejects requests whose userId does not resolve.
    const requests = await Request.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch requests." });
  }
}
