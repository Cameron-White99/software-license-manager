const UserRepository = require('./UserRepository');
const LicenseRepository = require('../licenses/LicenseRepository');
const FeedbackRepository = require('../feedback/FeedbackRepository');
const NotificationRepository = require('../notifications/NotificationRepository');
const { createError } = require('../middleware/ErrorMiddleware');

class UserFacade {
	async deleteAccount(id, actor) {
		if (actor._id.equals(id)) throw createError('You cannot delete your own account.');

		const user = await UserRepository.deleteById(id);
		if (!user) throw createError('User not found.', 404);

		await Promise.all([
			LicenseRepository.deleteByUser(user._id),
			FeedbackRepository.deleteByUser(user._id),
			NotificationRepository.deleteByUser(user._id),
		]);
		return { message: 'User deleted.' };
	}
}

module.exports = new UserFacade();
