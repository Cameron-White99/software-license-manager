
import express from 'express';
import LicenseService from './LicenseService.js';
import LicenseFacade from './LicenseFacade.js';
import { asyncHandler } from '../middleware/ErrorMiddleware.js';
import { protect } from '../middleware/AuthMiddleware.js';
import { isAdmin } from '../middleware/RoleMiddleware.js';
import { ok, created } from '../utils/ApiResponse.js';

const router = express.Router();

// Get licenses belonging to the logged-in user
router.get('/mine', protect, asyncHandler(async (req, res) => {
  ok(res, await LicenseService.listForUser(req.user._id));
}));

// Get all licenses (admin only)
router.get('/', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await LicenseService.listAll());
}));

// Request a new license
router.post('/', protect, asyncHandler(async (req, res) => {
  created(res, await LicenseFacade.request(req.user, req.body));
}));

// Update license status
router.patch('/:id/status', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await LicenseFacade.review(req.params.id, req.body.status));
}));

// Cancel license
router.patch('/:id/cancel', protect, asyncHandler(async (req, res) => {
  ok(res, await LicenseFacade.cancel(req.params.id, req.user));
}));

// Delete license (admin only)
router.delete('/:id', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await LicenseService.remove(req.params.id));
}));

export default router;
