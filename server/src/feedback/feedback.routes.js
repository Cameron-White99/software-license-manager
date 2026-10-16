
import express from 'express';

import FeedbackService from './FeedbackService.js';
import { protect } from '../middleware/AuthMiddleware.js';
import { isAdmin } from '../middleware/RoleMiddleware.js';
import { asyncHandler } from '../middleware/ErrorMiddleware.js';

const router = express.Router();
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

router.get(
  '/software/:id',
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const feedback = await FeedbackService.getSoftwareFeedback(req.params.id);
    return res.status(200).json(feedback);
  })
);

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
