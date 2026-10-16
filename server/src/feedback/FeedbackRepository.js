
import Feedback from './Feedback.js';

function findByUserAndVersion(userId, versionId) {
  return Feedback.findOne({
    user: userId,
    version: versionId
  });
}

function existsByUserAndVersion(userId, versionId) {
  return Feedback.exists({
    user: userId,
    version: versionId
  });
}

function create(data) {
  return Feedback.create(data);
}

function findByVersionIds(versionIds) {
  return Feedback.find({ version: { $in: versionIds } })
    .populate('user', 'full_name email')
    .sort({ created_at: -1 });
}

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

function deleteByUser(userId) {
  return Feedback.deleteMany({ user: userId });
}

export default {
  findByVersionIds,
  findByUserAndVersion,
  existsByUserAndVersion,
  create,
  findByUser,
  deleteByUser
};

