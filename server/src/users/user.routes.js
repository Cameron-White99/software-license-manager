const express = require('express');
const UserService = require('./UserService');
const { asyncHandler } = require('../middleware/ErrorMiddleware');
const { protect } = require('../middleware/AuthMiddleware');
const { isAdmin } = require('../middleware/RoleMiddleware');
const { ok, created } = require('../utils/ApiResponse');

const router = express.Router();

router.put('/me', protect, asyncHandler(async (req, res) => {
  ok(res, await UserService.updateMe(req.user, req.body));
}));

router.put('/me/password', protect, asyncHandler(async (req, res) => {
  ok(res, await UserService.updatePassword(req.user, req.body));
}));

router.get('/', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await UserService.list());
}));

router.post('/', protect, isAdmin, asyncHandler(async (req, res) => {
  created(res, await UserService.create(req.body));
}));

router.put('/:id', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await UserService.update(req.params.id, req.body, req.user));
}));

router.patch('/:id/status', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await UserService.updateStatus(req.params.id, req.body.status, req.user));
}));

router.delete('/:id', protect, isAdmin, asyncHandler(async (req, res) => {
  ok(res, await UserService.remove(req.params.id, req.user));
}));

module.exports = router;
