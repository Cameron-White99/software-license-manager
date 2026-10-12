import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import requestRoutes from "./src/routes/requests.js";
import assignmentRoutes from "./src/routes/assignments.js";
import licenseRoute from './src/licenses/license.routes.js';
import notificationRoute from './src/notifications/notification.routes.js';
import softwareRoute from './src/software/software.routes.js';

import feedbackRoutes from './src/feedback/feedback.routes.js';

import { errorHandler } from './src/middleware/ErrorMiddleware.js';



import  Database   from './src/database/Database.js';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, "../../client/dist");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/requests", requestRoutes);
app.use("/api/assignments", assignmentRoutes);

app.use('/api/software', softwareRoute);
app.use('/api/licenses', licenseRoute);
app.use("/api/notifications", notificationRoute);

app.use('/api/feedback', feedbackRoutes);

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

// Centralized error handling for API routes.
app.use(errorHandler);

const PORT = process.env.PORT || 80;

Database.getInstance()
  .connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server.');
    console.error(err.message);
    process.exit(1);
  });