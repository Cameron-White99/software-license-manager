import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

// R1 support: authentication is out of scope (see Phase 1 assumptions), but a
// Request still needs a real userId to reference. These two demo accounts stand
// in for the logged-in Admin and User. The _ids are fixed so the client can send
// them in the x-user-id header without a login flow — see client/src/api/session.js.
const DEMO_USERS = [
  {
    _id: new mongoose.Types.ObjectId("000000000000000000000001"),
    name: "Demo Admin",
    email: "admin@example.com",
    role: "Admin",
  },
  {
    _id: new mongoose.Types.ObjectId("000000000000000000000002"),
    name: "Demo User",
    email: "user@example.com",
    role: "User",
  },
];

async function seed() {
  await connectDB();
  for (const user of DEMO_USERS) {
    await User.findByIdAndUpdate(user._id, user, { upsert: true, new: true });
    console.log(`Seeded ${user.role}: ${user.email} (${user._id})`);
  }
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
