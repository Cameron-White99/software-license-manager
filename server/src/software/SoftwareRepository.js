import Software from './Software.js';

function findActive() {
  return Software.find({ deleted_at: null }).sort({ created_at: 1, software_name: 1 });
}

function findActiveById(id) {
  return Software.findOne({ _id: id, deleted_at: null });
}

function findActiveByName(name) {
  return Software.findOne({ software_name: name, deleted_at: null });
}

function findActiveByNameExcluding(name, id) {
  return Software.findOne({ software_name: name, deleted_at: null, _id: { $ne: id } });
}

function create(data) {
  return Software.create(data);
}

function save(software) {
  return software.save();
}

export default{
  findActive,
  findActiveById,
  findActiveByName,
  findActiveByNameExcluding,
  create,
  save,
};
