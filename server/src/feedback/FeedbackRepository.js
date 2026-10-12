
import Feedback from './Feedback.js';

// Find feedback submitted by a user for a specific version.
function findByUserAndVersion(userId, versionId) {
  return Feedback.findOne({
    user: userId,
    version: versionId
  });
}

// Check whether feedback already exists.
function existsByUserAndVersion(userId, versionId) {
  return Feedback.exists({
    user: userId,
    version: versionId
  });
}

// Save a new feedback record.
function create(data) {
  return Feedback.create(data);
}

/**
 * SLM-196: Fetch feedback submitted by a user.
 * Display newest feedback first.
 */
function findByUser(userId) {
  return Feedback.find({ user: userId })
    .populate({
      path: 'version',
      select: 'version_number software',
      populate: {
        path: 'software',
        select: 'software_name'
      }
    })
    .sort({ created_at: -1 });
}


export default {
  findByUserAndVersion,
  existsByUserAndVersion,
  create,
  findByUser
};

