import mongoose from "mongoose";
import Assignment from "../models/Assignment.js";
import { getUserId } from "../middleware/auth.js";
// Registers the License model so populate("licenseId") resolves rather than
// throwing MissingSchemaError - see the R1 self-review on PR #1.
import "../models/License.js";

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
