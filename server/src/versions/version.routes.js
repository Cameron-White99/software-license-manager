import express from 'express';
import VersionService from './VersionService.js';
import { asyncHandler } from '../middleware/ErrorMiddleware.js';
import { protect } from '../middleware/AuthMiddleware.js';
import { isAdmin } from '../middleware/RoleMiddleware.js';
import { ok, created } from '../utils/ApiResponse.js';

const router = express.Router();

router.get('/', protect, asyncHandler(async (req, res) => {
  ok(res, await VersionService.list());
}));

router.post('/', protect, isAdmin, asyncHandler(async (req, res) => {
  created(res, await VersionService.create(req.body));
}));

router.delete('/:id', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await VersionService.remove(req.params.id));
}));

export default router;