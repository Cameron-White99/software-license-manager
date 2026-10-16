
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
  findByUserAndVersion,
  existsByUserAndVersion,
  create,
  findByUser,
  deleteByUser
};

