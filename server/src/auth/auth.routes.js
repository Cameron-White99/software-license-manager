const express = require('express');
const AuthService = require('./AuthService');
const { asyncHandler } = require('../middleware/ErrorMiddleware');
const { protect } = require('../middleware/AuthMiddleware');
const { created, ok } = require('../utils/ApiResponse');

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  created(res, await AuthService.register(req.body));
}));

router.post('/login', asyncHandler(async (req, res) => {
  ok(res, await AuthService.login(req.body));
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
  ok(res, await AuthService.forgotPassword(req.body));
}));

router.get('/me', protect, asyncHandler(async (req, res) => {
  ok(res, AuthService.currentUser(req.user));
}));

module.exports = router;
