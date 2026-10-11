import express from 'express';
import AuthService from './AuthService';
import { asyncHandler } from '../middleware/ErrorMiddleware';
import { protect } from '../middleware/AuthMiddleware';
import { created, ok } from '../utils/ApiResponse';

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
