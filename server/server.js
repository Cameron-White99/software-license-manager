import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import versionRoute from './src/versions/version.routes.js';
import authRoutes from './src/auth/auth.routes.js';
import userRoutes from './src/users/user.routes.js';
import licenseRoute from './src/licenses/license.routes.js';
import notificationRoute from './src/notifications/notification.routes.js';
import softwareRoute from './src/software/software.routes.js';

import feedbackRoutes from './src/feedback/feedback.routes.js';

import { errorHandler } from './src/middleware/ErrorMiddleware.js';



import  Database   from './src/database/Database.js';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLIENT_DIST = path.join(__dirname, "../client/dist");

const app = express();
app.use(cors());
app.use(express.json());


// Public liveness probe used by the CI/CD health check.
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/versions', versionRoute);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);


app.use('/api/software', softwareRoute);
app.use('/api/licenses', licenseRoute);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoute);

app.use(errorHandler);


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