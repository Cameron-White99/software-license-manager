
import express from 'express';

import FeedbackService from './FeedbackService.js';
import { protect } from '../middleware/AuthMiddleware.js';
import { asyncHandler } from '../middleware/ErrorMiddleware.js';

const router = express.Router();

/**
 * SLM-196: Get feedback history of the logged-in user.
 * GET /api/feedback/my
 */
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const feedback = await FeedbackService.getMyFeedback(req.user._id);

    return res.status(200).json({
      message: 'Feedback history retrieved successfully.',
      data: feedback
    });
  })
);

/**
 * SLM-181: Submit feedback for a software version.
 * POST /api/feedback
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const feedback = await FeedbackService.createFeedback(
      req.user._id,
      req.body
    );

    return res.status(201).json({
      message: 'Feedback submitted successfully.',
      data: feedback
    });
  })
);


export default router;
