import mongoose from "mongoose";
import Request from "../models/Request.js";
import User from "../models/User.js";
import License from "../models/License.js";
import Assignment from "../models/Assignment.js";
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

// R3: detail for a single request, for the approve/reject screen.
// Returns the matching license alongside it so the screen can show the
// seats-available line without a second round trip. license is null when
// nothing in inventory matches the requested product.
export async function getRequest(req, res) {
  try {
    const request = await Request.findById(req.params.id).populate("userId", "name email");
    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    const license = await License.findOne({ productName: request.productRequested });

    return res.json({ request, license });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch request." });
  }
}

// R3: Admin approves a pending request and assigns a license seat.
// Acceptance criteria:
//  - creates an Assignment (Active) linking the request's user to a matching License
//  - sets request.status = Approved and increments the license's seatsUsed
//  - Admin only (enforced by the route)
//
// NOTE: this deliberately does not verify the license has a free seat before
// assigning. Seat-capacity validation is R3a, tracked as its own story - see
// NextSteps.md. Approving against a full license currently pushes seatsUsed
// past totalSeats.
export async function approveRequest(req, res) {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }
    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({ error: `Request has already been ${request.status.toLowerCase()}.` });
    }

    const license = await License.findOne({ productName: request.productRequested });
    if (!license) {
      return res.status(400).json({
        error: `No license in inventory matches "${request.productRequested}".`,
      });
    }

    const assignment = await Assignment.create({
      licenseId: license._id,
      userId: request.userId,
      status: "Active",
    });

    // The pre-save hook on License re-derives status (Active/Full) from seatsUsed.
    license.seatsUsed += 1;
    await license.save();

    request.status = "Approved";
    await request.save();

    return res.json({ request, assignment, license });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to approve request." });
  }
}

// R3: Admin rejects a pending request. No Assignment is created and no seat
// is consumed.
export async function rejectRequest(req, res) {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }
    if (request.status !== "Pending") {
      return res
        .status(400)
        .json({ error: `Request has already been ${request.status.toLowerCase()}.` });
    }

    request.status = "Rejected";
    await request.save();

    return res.json(request);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to reject request." });
  }
}
