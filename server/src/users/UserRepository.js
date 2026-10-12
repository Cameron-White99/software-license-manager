import User from './User.js';

async function findAll() {
	return User.find().select('-password_hash').sort({ full_name: 1 });
}

function findById(id) {
	return User.findById(id);
}

function findByEmail(email) {
	return User.findOne({ email });
}

function findByEmailExcluding(email, id) {
	return User.findOne({ email, _id: { $ne: id } });
}

function create(data) {
	return User.create(data);
}

function save(user) {
	return user.save();
}

function updateStatus(id, status) {
	return User.findByIdAndUpdate(id, { status }, { new: true }).select('-password_hash');
}

function deleteById(id) {
	return User.findByIdAndDelete(id);
}

function findActiveAdmins() {
	return User.find({ role: 'admin', status: 'active' });
}

export default{
	findAll,
	findById,
	findByEmail,
	findByEmailExcluding,
	create,
	save,
	updateStatus,
	deleteById,
	findActiveAdmins,
};
