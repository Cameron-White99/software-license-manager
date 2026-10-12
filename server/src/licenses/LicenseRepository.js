import License from './License.js';

function withDetails(query) {
  return query
    .populate('user', 'full_name email role')
    .populate('assigned_software', 'software_name')
    .populate('version_number', 'version_number')
    .sort({ requested_at: -1 });
}

function findByUser(userId) {
  return withDetails(License.find({ user: userId }));
}

function findAll() {
  return withDetails(License.find());
}

function findByIdWithSoftware(id) {
  return License.findById(id).populate('assigned_software', 'software_name');
}

function findOneForUser(id, userId) {
  return License.findOne({ _id: id, user: userId }).populate('assigned_software', 'software_name');
}

function findOpenForUserAndSoftware(userId, softwareId) {
  return License.findOne({
    user: userId,
    assigned_software: softwareId,
    status: { $in: ['Pending', 'Approved'] },
  });
}

function create(data) {
  return License.create(data);
}

function findByIdWithDetails(id) {
  return withDetails(License.findById(id));
}

function save(license) {
  return license.save();
}

function deleteById(id) {
  return License.findByIdAndDelete(id);
}

function existsForVersion(versionId) {
  return License.exists({ version_number: versionId });
}

function deleteByUser(userId) {
  return License.deleteMany({ user: userId });
}

export default {
  findByUser,
  findAll,
  findByIdWithSoftware,
  findOneForUser,
  findOpenForUserAndSoftware,
  create,
  findByIdWithDetails,
  save,
  deleteById,
  existsForVersion,
  deleteByUser,
};