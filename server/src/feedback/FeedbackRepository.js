
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

export default {
  findByUserAndVersion,
  existsByUserAndVersion,
  create
};
