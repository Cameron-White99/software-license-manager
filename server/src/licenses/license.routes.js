import express from 'express';
import LicenseService from './LicenseService';
import LicenseFacade from './LicenseFacade';
import { asyncHandler } from '../middleware/ErrorMiddleware';
import { protect } from '../middleware/AuthMiddleware';
import { isAdmin } from '../middleware/RoleMiddleware';
import { ok, created } from '../utils/ApiResponse';

const router = express.Router();

router.get('/mine', protect, asyncHandler(async (req, res) => {
  ok(res, await LicenseService.listForUser(req.user._id));
}));

router.get('/', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await LicenseService.listAll());
}));

router.post('/', protect, asyncHandler(async (req, res) => {
  created(res, await LicenseFacade.request(req.user, req.body));
}));

router.patch('/:id/status', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await LicenseFacade.review(req.params.id, req.body.status));
}));

router.patch('/:id/cancel', protect, asyncHandler(async (req, res) => {
  ok(res, await LicenseFacade.cancel(req.params.id, req.user));
}));

router.delete('/:id', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await LicenseService.remove(req.params.id));
}));

export default router;