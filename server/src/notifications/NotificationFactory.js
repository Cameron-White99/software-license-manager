class NotificationFactory {
    static create(type, details = {}) {
      const softwareName = details.softwareName || 'software';
      const messages = {
        request: `${details.fullName} requested a license for ${softwareName}.`,
        Approved: `Your request for ${softwareName} has been approved.`,
        Rejected: `Your request for ${softwareName} has been rejected.`,
        Expired: `Your license for ${softwareName} has been revoked.`,
        cancelled: `Your subscription for ${softwareName} has been cancelled.`,
        expiring: `Your license for ${softwareName} expires within 24 hours.`,
      };
  
      const message = messages[type];
      if (!message) {
        const error = new Error('Unknown notification type.');
        error.statusCode = 400;
        throw error;
      }
  
      return { user: details.userId, message };
    }
  }
  
  export default NotificationFactory;