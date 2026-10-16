import {
  RequestNotification,
  ApprovedNotification,
  RejectedNotification,
  ExpiredNotification,
  CancelledNotification,
  ExpiringNotification,
} from './NotificationMessage.js';

const types = {
  request: RequestNotification,
  Approved: ApprovedNotification,
  Rejected: RejectedNotification,
  Expired: ExpiredNotification,
  cancelled: CancelledNotification,
  expiring: ExpiringNotification
};
class NotificationFactory {
  static create(type, details = {}) {
    const NotificationType = types[type];
    if (!NotificationType) {
      const error = new Error('Unknown notification type.');
      error.statusCode = 400;
      throw error;
    }
    return new NotificationType(details).toDocument();
  }
}
  
export default NotificationFactory;