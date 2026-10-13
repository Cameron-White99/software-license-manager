import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  try {
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB_NAME || undefined });
    console.log("MongoDB connected:", uri);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}
