
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

export default router;
