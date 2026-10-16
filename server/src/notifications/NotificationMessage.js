class NotificationMessage {
    constructor(details) {
      this.details = details;
    }
  
    message() {
      throw new Error('Subclass must implement message().');
    }
  
    toDocument() {
      return {
        user: this.details.userId,
        message: this.message(),
      };
    }
  }
  
  class RequestNotification extends NotificationMessage {
    message() {
      return `${this.details.fullName} requested a license for ${this.details.softwareName || 'software'}.`;
    }
  }
  
  class ApprovedNotification extends NotificationMessage {
    message() {
      return `Your request for ${this.details.softwareName || 'software'} has been approved.`;
    }
  }
  
  class RejectedNotification extends NotificationMessage {
    message() {
      return `Your request for ${this.details.softwareName || 'software'} has been rejected.`;
    }
  }
  
  class ExpiredNotification extends NotificationMessage {
    message() {
      return `Your license for ${this.details.softwareName || 'software'} has been revoked.`;
    }
  }
  
  class CancelledNotification extends NotificationMessage {
    message() {
      return `Your subscription for ${this.details.softwareName || 'software'} has been cancelled.`;
    }
  }
  
  class ExpiringNotification extends NotificationMessage {
    message() {
      return `Your license for ${this.details.softwareName || 'software'} expires within 24 hours.`;
    }
  }
  
  export {
    RequestNotification,
    ApprovedNotification,
    RejectedNotification,
    ExpiredNotification,
    CancelledNotification,
    ExpiringNotification,
  };