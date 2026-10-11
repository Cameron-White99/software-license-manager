
import Feedback from './Feedback.js';

// Get feedback submitted by a user
function findByUser(userId) {
  return Feedback.find({ user: userId })
    .populate({
      path: 'version',
      populate: {
        path: 'software',
        select: 'software_name'
      }
    })
    .sort({ created_at: -1 });
}

// Check duplicate feedback
function findByUserAndVersion(userId, versionId) {
  return Feedback.findOne({
    user: userId,
    version: versionId
  });
}

// Get feedback for software versions
function findByVersionIds(versionIds) {
  return Feedback.find({
    version: { $in: versionIds }
  })
    .populate('user', 'full_name email')
    .sort({ created_at: -1 });
}

// Save new feedback
function create(data) {
  return Feedback.create(data);
}

// Get feedback with software version details
function findByIdWithVersion(id) {
  return Feedback.findById(id).populate({
    path: 'version',
    populate: {
      path: 'software',
      select: 'software_name'
    }
  });
}

// Delete feedback belonging to a user
function deleteByUser(userId) {
  return Feedback.deleteMany({ user: userId });
}

export default {
  findByUser,
  findByUserAndVersion,
  findByVersionIds,
  create,
  findByIdWithVersion,
  deleteByUser
};
