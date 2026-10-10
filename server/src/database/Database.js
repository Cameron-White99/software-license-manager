import mongoose from "mongoose";

class Database {
  constructor() {
    console.log("Database");
    if (Database.instance) {
      return Database.instance;
    }
    this.connected = false;
    Database.instance = this;
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect() {
    if (this.connected) return;
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("Set MONGODB_URI in the server .env file");
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 30000 });
    console.log("Connected to MongoDB");
    this.connected = true;
  }
}

export default Database;
