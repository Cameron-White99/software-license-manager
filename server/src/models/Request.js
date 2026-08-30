import mongoose from "mongoose";

// R1: created when a User submits a license request.
// R3: status moves Pending -> Approved/Rejected when Admin actions it.
const requestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productRequested: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true } // createdAt doubles as requestedDate
);

export default mongoose.model("Request", requestSchema);
