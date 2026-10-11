
import Notification from './Notification.js';

// Get notifications belonging to a user
export function findByUser(userId) {
  return Notification.find({ user: userId })
    .sort({ created_at: -1 });
}

// Create a single notification
export function create(data) {
  return Notification.create(data);
}

// Create multiple notifications
export function insertMany(data) {
  return Notification.insertMany(data);
}
