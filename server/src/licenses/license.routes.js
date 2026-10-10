import express from 'express';
import * as LicenseService  from './LicenseService.js';
import { protect } from '../middleware/AuthMiddleware.js';

const router = express.Router();

router.get('/mine', protect, async (req, res) => {
    const licenseData = await LicenseService.listForUser(req.user._id);
    return res.json(licenseData);
});

export default router;
