import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  message: { type: String, required: true },
  read_at: { type: Boolean, required: true, default: false },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("notification", notificationSchema);
