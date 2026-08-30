import mongoose from "mongoose";

// R3: created when Admin approves a Request against a License with an available seat.
// R6/R7: status moves Active -> Revoked, and the License seat count is reclaimed.
// Revoked assignments are kept (not deleted) so R8's history view has something to show.
const assignmentSchema = new mongoose.Schema(
  {
    licenseId: { type: mongoose.Schema.Types.ObjectId, ref: "License", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["Active", "Revoked"], default: "Active" },
  },
  { timestamps: true } // createdAt doubles as assignedDate
);

export default mongoose.model("Assignment", assignmentSchema);
