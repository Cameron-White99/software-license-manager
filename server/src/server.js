import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import licenseRoutes from "./routes/licenses.js";
import requestRoutes from "./routes/requests.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, "../../client/dist");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/licenses", licenseRoutes);
app.use("/api/requests", requestRoutes);
// Next up (per build order): /api/assignments (R5/R6/R7)

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Serve the built React app (run `npm run build` in /client first).
// In local dev, run the Vite dev server separately instead — this static
// serving only applies once client/dist exists (i.e. in production/EC2).
app.use(express.static(CLIENT_DIST));

// Any non-API route falls through to index.html so React Router can handle
// client-side routes like /licenses, /requests, etc.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(CLIENT_DIST, "index.html"));
});

const PORT = process.env.PORT || 80;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
