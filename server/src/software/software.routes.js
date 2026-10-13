import express from 'express';
import SoftwareService from './SoftwareService.js';
import { asyncHandler } from '../middleware/ErrorMiddleware.js';
import { protect } from '../middleware/AuthMiddleware.js';
import { isAdmin } from '../middleware/RoleMiddleware.js';
import { ok, created } from '../utils/ApiResponse.js';

const router = express.Router();

router.get('/', protect, asyncHandler(async (req, res) => {
  ok(res, await SoftwareService.list());
}));

router.get('/:id', protect, asyncHandler(async (req, res) => {
  ok(res, await SoftwareService.getById(req.params.id));
}));

router.post('/', protect, isAdmin, asyncHandler(async (req, res) => {
  created(res, await SoftwareService.create(req.body));
}));

router.put('/:id', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await SoftwareService.update(req.params.id, req.body));
}));

router.delete('/:id', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await SoftwareService.remove(req.params.id));
}));

export default router;
