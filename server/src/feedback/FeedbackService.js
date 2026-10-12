
import mongoose from 'mongoose';

import FeedbackRepository from './FeedbackRepository.js';
import VersionRepository from '../versions/VersionRepository.js';
import { createError } from '../middleware/ErrorMiddleware.js';

/**
 * SLM-195: Validate and create feedback for a software version.
 */
async function createFeedback(userId, data = {}) {
  const { versionId, rating, comments } = data;

  // Validate authenticated user ID.
  if (!mongoose.isValidObjectId(userId)) {
    throw createError('Please sign in to submit feedback.', 401);
  }

  // Validate software version ID.
  if (!mongoose.isValidObjectId(versionId)) {
    throw createError('Please select a valid software version.', 400);
  }

  // Rating must be an integer from 1 to 5.
  if (
    typeof rating !== 'number' ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw createError('Rating must be a whole number between 1 and 5.', 400);
  }

  // Comments must contain meaningful text.
  if (typeof comments !== 'string' || !comments.trim()) {
    throw createError('Please enter your feedback comments.', 400);
  }

  const cleanedComments = comments.trim();

  if (cleanedComments.length > 1000) {
    throw createError('Feedback comments cannot exceed 1000 characters.', 400);
  }

  // Confirm that the selected version exists.
  const version = await VersionRepository.findById(versionId);

  if (!version) {
    throw createError('Selected software version was not found.', 404);
  }

  // Prevent duplicate feedback from the same user for the same version.
  const existingFeedback =
    await FeedbackRepository.findByUserAndVersion(userId, versionId);

  if (existingFeedback) {
    throw createError(
      'You have already submitted feedback for this software version.',
      409
    );
  }

  try {
    return await FeedbackRepository.create({
      user: userId,
      version: versionId,
      rating,
      comments: cleanedComments
    });
  } catch (error) {
    // Handle duplicates caused by simultaneous submissions.
    if (error.code === 11000) {
      throw createError(
        'You have already submitted feedback for this software version.',
        409
      );
    }

    throw error;
  }
}

/**
 * SLM-196: Get feedback history for the signed-in user.
 */
async function getMyFeedback(userId) {
  if (!mongoose.isValidObjectId(userId)) {
    throw createError('Please sign in to view your feedback.', 401);
  }

  return FeedbackRepository.findByUser(userId);
}


export default {
  createFeedback,
    getMyFeedback
};
