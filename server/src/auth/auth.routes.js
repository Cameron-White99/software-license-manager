import express from 'express';
import AuthService from './AuthService.js';
import { asyncHandler } from '../middleware/ErrorMiddleware.js';
import { protect } from '../middleware/AuthMiddleware.js';
import { created, ok } from '../utils/ApiResponse.js';

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

export default router;
