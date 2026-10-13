import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../users/User.js";
import PasswordService from "../auth/PasswordService.js";

dotenv.config();
const DEMO_USERS = [
  {
    full_name: "Demo Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@example.com",
    password: process.env.SEED_ADMIN_PASSWORD || "Password123!",
    passwordVar: "SEED_ADMIN_PASSWORD",
    role: "admin",
  },
  {
    full_name: "Demo User",
    email: process.env.SEED_USER_EMAIL || "user@example.com",
    password: process.env.SEED_USER_PASSWORD || "Password123!",
    passwordVar: "SEED_USER_PASSWORD",
    role: "user",
  },
];

function checkEnv() {
  const problems = [];
  for (const u of DEMO_USERS) {
    if (!u.password) {
      problems.push(`${u.passwordVar} is not set.`);
      continue;
    }
    const error = PasswordService.validate(u.password);
    if (error) problems.push(`${u.passwordVar}: ${error}`);
  }
  if (problems.length) {
    console.error(`Cannot seed demo accounts:\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
}

async function seed() {
  checkEnv();
  await connectDB();

  for (const u of DEMO_USERS) {
    const email = u.email.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (!existing) {
      await User.create({
        full_name: u.full_name,
        email,
        password_hash: await PasswordService.hash(u.password),
        role: u.role,
        status: "active",
      });
      console.log(`Created ${u.role}: ${email}`);
      continue;
    }

    existing.full_name = u.full_name;
    existing.role = u.role;
    existing.status = "active";
    if (!existing.password_hash) {
      existing.password_hash = await PasswordService.hash(u.password);
    }
    await existing.save();
    console.log(`Updated ${u.role}: ${email}`);
  }

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
