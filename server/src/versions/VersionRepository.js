import SoftwareVersion from './SoftwareVersion';

function findBySoftwareIds(ids) {
  return SoftwareVersion.find({ software: { $in: ids } }).sort({ release_date: -1, _id: -1 });
}

function findBySoftware(softwareId) {
  return SoftwareVersion.find({ software: softwareId }).sort({ release_date: -1 });
}

function findAllWithSoftware() {
  return SoftwareVersion.find()
    .populate('software', 'software_name deleted_at')
    .sort({ release_date: -1, version_number: 1 });
}

function findByVersionNumber(versionNumber) {
  return SoftwareVersion.findOne({ version_number: versionNumber });
}

function findByIdAndSoftware(id, softwareId) {
  return SoftwareVersion.findOne({ _id: id, software: softwareId });
}

function findById(id) {
  return SoftwareVersion.findById(id);
}

function create(data) {
  return SoftwareVersion.create(data);
}

function deleteById(id) {
  return SoftwareVersion.findByIdAndDelete(id);
}

export default {
  findBySoftwareIds,
  findBySoftware,
  findAllWithSoftware,
  findByVersionNumber,
  findByIdAndSoftware,
  findById,
  create,
  deleteById,
};