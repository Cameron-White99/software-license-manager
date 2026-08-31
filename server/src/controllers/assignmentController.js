import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import { getUserId } from "../middleware/auth.js";
// Registers the License model so populate("licenseId") resolves rather than
// throwing MissingSchemaError - see the R1 self-review on PR #1.
import "../models/License.js";
import "../models/User.js";

// R4: the signed-in User's currently held licenses, for the My Licenses view.
// Acceptance criteria:
//  - shows product name and the date the seat was assigned
//  - only Active assignments; revoked ones belong to R8's history view
//  - scoped to the requesting user only - never anyone else's licenses
export async function listMyAssignments(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "A valid user id is required." });
    }

    const assignments = await Assignment.find({ userId, status: "Active" })
      .populate("licenseId", "productName vendor")
      .sort({ createdAt: -1 });

    return res.json(assignments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch your licenses." });
  }
}

// R5: Admin views every active license assignment across the organisation.
// Acceptance criteria:
//  - shows assigned user (name), license/product, and assignment date
//  - can filter by license via ?licenseId=
//  - revoked assignments do not appear here (they belong to R8's history)
export async function listAssignments(req, res) {
  try {
    const { licenseId } = req.query;

    // Reject a malformed filter rather than silently returning everything,
    // which would look like "the filter found no matches" - same reasoning as
    // R2's invalid ?status= handling.
    if (licenseId && !mongoose.isValidObjectId(licenseId)) {
      return res.status(400).json({ error: "licenseId must be a valid id." });
    }

    const filter = { status: "Active" };
    if (licenseId) filter.licenseId = licenseId;

    const assignments = await Assignment.find(filter)
      .populate("userId", "name email")
      .populate("licenseId", "productName vendor")
      .sort({ createdAt: -1 });

    return res.json(assignments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch assignments." });
  }
}

// R6: Admin revokes an active assignment (e.g. employee offboarding).
// Acceptance criteria:
//  - only assignments with status Active can be revoked
//  - on confirm, status becomes Revoked
// The revoked record is retained, not deleted, so R8's history view has
// something to show.
//
// NOTE: this sets status only. Reclaiming the seat (decrementing seatsUsed
// and reverting the license from Full to Active) is R7, which extends this
// same function - see NextSteps.md. Until then a revoked seat stays counted
// against the license.
export async function revokeAssignment(req, res) {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found." });
    }
    if (assignment.status !== "Active") {
      return res
        .status(400)
        .json({ error: `Assignment has already been ${assignment.status.toLowerCase()}.` });
    }

    assignment.status = "Revoked";
    await assignment.save();

    return res.json(assignment);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to revoke assignment." });
  }
}
