import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import License from "../models/License.js";
import Request from "../models/Request.js";
import Assignment from "../models/Assignment.js";

dotenv.config();

// Resets the database to a clean, demo-ready state: clears every collection,
// then reseeds demo users, licence inventory, one request in each status and one
// active assignment. The point is that someone opening the deployed app sees a
// populated, working system rather than a wall of empty states.
//
// DESTRUCTIVE: it deletes everything in the target database. It prints the
// database it is connected to, and the document counts it is about to remove,
// before deleting anything - check that line before running it anywhere real.
//
// Usage:  npm run reset:demo          (uses MONGO_URI from .env, same as the app)

// These MUST stay in step with server/src/scripts/seedUsers.js, which is the
// original source of these ids, and with client/src/api/session.js, which sends
// them as the x-user-id header. They are copied rather than imported because
// seedUsers.js neither exports them nor is import-safe - it runs its seed at
// module top level, so importing it would trigger a second seed and close the
// connection out from under this script.
const DEMO_ADMIN_ID = new mongoose.Types.ObjectId("000000000000000000000001");
const DEMO_USER_ID = new mongoose.Types.ObjectId("000000000000000000000002");

const DEMO_USERS = [
  { _id: DEMO_ADMIN_ID, name: "Demo Admin", email: "admin@example.com", role: "Admin" },
  { _id: DEMO_USER_ID, name: "Demo User", email: "user@example.com", role: "User" },
];

// Dates are relative to now so the demo data never looks stale.
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

async function resetDemo() {
  await connectDB();

  // Print the target before touching anything, so it is verifiable which
  // database is being reset - this matters most on Atlas, where a URI without a
  // path segment silently lands on the default database rather than a named one.
  const { name, host } = mongoose.connection;
  console.log(`\nTarget database: "${name}"  (host: ${host})`);

  const before = {
    users: await User.countDocuments(),
    licenses: await License.countDocuments(),
    requests: await Request.countDocuments(),
    assignments: await Assignment.countDocuments(),
  };
  console.log(
    `About to delete: ${before.users} users, ${before.licenses} licenses, ` +
      `${before.requests} requests, ${before.assignments} assignments\n`
  );

  await Promise.all([
    User.deleteMany({}),
    License.deleteMany({}),
    Request.deleteMany({}),
    Assignment.deleteMany({}),
  ]);
  console.log("Cleared all four collections.");

  // --- Users -------------------------------------------------------------
  await User.insertMany(DEMO_USERS);
  for (const user of DEMO_USERS) {
    console.log(`  user       ${user.role.padEnd(5)} ${user.email} (${user._id})`);
  }

  // --- Licences ----------------------------------------------------------
  // create() rather than insertMany() so the License pre-save hook runs and
  // derives status (Active/Full) from seatsUsed.
  const figma = await License.create({
    productName: "Figma Professional",
    vendor: "Figma, Inc.",
    totalSeats: 5,
    seatsUsed: 1, // consumed by the active assignment below
  });
  const slack = await License.create({
    productName: "Slack Premium",
    vendor: "Slack Technologies",
    totalSeats: 3,
    seatsUsed: 0,
  });
  const intellij = await License.create({
    productName: "JetBrains IntelliJ",
    vendor: "JetBrains s.r.o.",
    totalSeats: 2,
    seatsUsed: 0,
  });
  for (const l of [figma, slack, intellij]) {
    console.log(
      `  license    ${l.productName.padEnd(20)} ${l.seatsUsed}/${l.totalSeats} seats  ${l.status}`
    );
  }

  // --- Requests: one in each status, all for the demo user ----------------
  // The Approved one is the request that produced the active assignment below,
  // so the seeded state tells a coherent story rather than being arbitrary rows.
  const requests = await Request.create([
    {
      userId: DEMO_USER_ID,
      productRequested: figma.productName,
      status: "Approved",
      createdAt: daysAgo(6),
    },
    {
      userId: DEMO_USER_ID,
      productRequested: intellij.productName,
      status: "Rejected",
      createdAt: daysAgo(3),
    },
    {
      userId: DEMO_USER_ID,
      productRequested: slack.productName,
      status: "Pending",
      createdAt: daysAgo(1),
    },
  ]);
  for (const r of requests) {
    console.log(`  request    ${r.productRequested.padEnd(20)} ${r.status}`);
  }

  // --- Assignment: the seat consumed on Figma -----------------------------
  await Assignment.create({
    licenseId: figma._id,
    userId: DEMO_USER_ID,
    status: "Active",
    createdAt: daysAgo(6),
  });
  console.log(`  assignment ${figma.productName.padEnd(20)} Active -> Demo User`);

  console.log(
    `\nDone. Database "${name}" now has ` +
      `${await User.countDocuments()} users, ${await License.countDocuments()} licenses, ` +
      `${await Request.countDocuments()} requests, ${await Assignment.countDocuments()} assignment(s).`
  );
  await mongoose.connection.close();
}

resetDemo()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error("\nreset:demo failed:", err.message);
    try {
      await mongoose.connection.close();
    } catch {
      // already closed or never opened - nothing useful to do here
    }
    process.exit(1);
  });
