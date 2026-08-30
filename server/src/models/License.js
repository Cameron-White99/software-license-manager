import mongoose from "mongoose";

// R2b: License records are created here (product name, vendor, total seats).
// R3 depends on this model existing with seatsUsed < totalSeats before approval.
// R7 updates seatsUsed and status when an assignment is revoked.
const licenseSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    vendor: { type: String, required: true, trim: true },
    totalSeats: {
      type: Number,
      required: true,
      min: [1, "Total seats must be a positive integer"],
      validate: {
        validator: Number.isInteger,
        message: "Total seats must be a whole number",
      },
    },
    seatsUsed: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ["Active", "Full"], default: "Active" },
  },
  { timestamps: true }
);

// Keep status consistent with seat usage whenever seatsUsed changes.
licenseSchema.pre("save", function (next) {
  this.status = this.seatsUsed >= this.totalSeats ? "Full" : "Active";
  next();
});

export default mongoose.model("License", licenseSchema);
