const express = require('express');
import VersionService from './VersionService';
const { asyncHandler } = require('../middleware/ErrorMiddleware');
import { protect } from '../middleware/AuthMiddleware';
import { isAdmin } from '../middleware/RoleMiddleware';
import { ok, created } from '../utils/ApiResponse';

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