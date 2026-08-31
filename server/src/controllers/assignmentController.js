import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import { getUserId } from "../middleware/auth.js";
// Also registers the License model so populate("licenseId") resolves rather
// than throwing MissingSchemaError - see the R1 self-review on PR #1.
import License from "../models/License.js";
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

// R8: the signed-in User's revoked licenses, for the read-only history view.
// Acceptance criteria:
//  - a revoked license appears here, not under My Licenses (which filters to
//    Active - see listMyAssignments)
//  - scoped to the requesting user only
// Sorted by updatedAt, which is when the revoke happened - createdAt is the
// original assignment date, so it would order by the wrong event.
export async function listMyHistory(req, res) {
  try {
    const userId = getUserId(req);
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "A valid user id is required." });
    }

    const history = await Assignment.find({ userId, status: "Revoked" })
      .populate("licenseId", "productName vendor")
      .sort({ updatedAt: -1 });

    return res.json(history);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch your license history." });
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
// R7: revoking also reclaims the seat - seatsUsed decrements and the License
// pre-save hook flips the licence back from Full to Active, making it
// reassignable. Before R7 the seat stayed counted against the license, so a
// full license could never be freed by revoking.
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

    // R7: reclaim the seat. Guarded with max(0, ...) so a license whose count
    // is already at zero - only reachable if data drifted - cannot be pushed
    // negative by a revoke. The pre-save hook re-derives Full/Active.
    const license = await License.findById(assignment.licenseId);
    if (license) {
      license.seatsUsed = Math.max(0, license.seatsUsed - 1);
      await license.save();
    }

    return res.json({ assignment, license });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to revoke assignment." });
  }
}
