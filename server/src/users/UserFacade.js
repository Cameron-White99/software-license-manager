import * as UserRepository from './UserRepository.js';
import LicenseRepository from '../licenses/LicenseRepository.js';
import FeedbackRepository from '../feedback/FeedbackRepository.js';
import * as NotificationRepository from '../notifications/NotificationRepository.js';
import { createError } from '../middleware/ErrorMiddleware.js';

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

export default new UserFacade();
