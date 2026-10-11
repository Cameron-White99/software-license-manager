
import mongoose from 'mongoose';
import FeedbackRepository from './FeedbackRepository.js';
import VersionRepository from '../versions/VersionRepository.js';
import { createError } from '../middleware/ErrorMiddleware.js';

// Get feedback submitted by a user
function listForUser(userId) {
  return FeedbackRepository.findByUser(userId);
}

// Get all feedback for a particular software
async function listForSoftware(softwareId) {
  if (!mongoose.isValidObjectId(softwareId)) {
    throw createError('Invalid software ID.', 400);
  }

  const versions = await VersionRepository.findBySoftware(
    softwareId
  );

  if (!versions.length) {
    return [];
  }

  return FeedbackRepository.findByVersionIds(
    versions.map((version) => version._id)
  );
}

// Create new feedback
async function create(user, body) {
  const versionId = body?.version;
  const comments =
    typeof body?.comments === 'string'
      ? body.comments.trim()
      : '';
  const rating = Number(body?.rating);

  // Validate software version
  if (!versionId || !mongoose.isValidObjectId(versionId)) {
    throw createError('Valid software version is required.', 400);
  }

  // Validate rating
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createError(
      'Rating must be a whole number from 1 to 5.',
      400
    );
  }

  // Validate comments
  if (!comments) {
    throw createError('Comments are required.', 400);
  }

  // Validate character limit
  if (comments.length > 1000) {
    throw createError(
      'Feedback comments cannot exceed 1000 characters.',
      400
    );
  }

  // Check version exists
  const version = await VersionRepository.findById(versionId);

  if (!version) {
    throw createError('Version not found.', 404);
  }

  // Check existing feedback
  const existing =
    await FeedbackRepository.findByUserAndVersion(
      user._id,
      version._id
    );

  if (existing) {
    throw createError(
      'You already submitted feedback for this version.',
      400
    );
  }

  // Save feedback
  const feedback = await FeedbackRepository.create({
    version: version._id,
    user: user._id,
    rating,
    comments
  });

  // Return saved feedback
  return FeedbackRepository.findByIdWithVersion(
    feedback._id
  );
}

export default {
  listForUser,
  listForSoftware,
  create
};
