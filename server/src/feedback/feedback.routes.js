
import express from 'express';

import FeedbackService from './FeedbackService.js';

import {
  asyncHandler
} from '../middleware/ErrorMiddleware.js';

import {
  protect
} from '../middleware/AuthMiddleware.js';

import {
  isAdmin
} from '../middleware/RoleMiddleware.js';

const router = express.Router();

// Get logged-in user's feedback
router.get(
  '/mine',
  protect,
  asyncHandler(async (req, res) => {
    const feedback =
      await FeedbackService.listForUser(req.user._id);

    return res.json(feedback);
  })
);

// Get feedback for a software (admin only)
router.get(
  '/software/:softwareId',
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const feedback =
      await FeedbackService.listForSoftware(
        req.params.softwareId
      );

    return res.json(feedback);
  })
);

// Submit new feedback
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const feedback = await FeedbackService.create(
      req.user,
      req.body
    );

    return res.status(201).json(feedback);
  })
);

export default router;
