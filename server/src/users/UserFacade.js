import UserRepository from './UserRepository';
import LicenseRepository from '../licenses/LicenseRepository';
import FeedbackRepository from '../feedback/FeedbackRepository';
import NotificationRepository from '../notifications/NotificationRepository';
import { createError } from '../middleware/ErrorMiddleware';

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
