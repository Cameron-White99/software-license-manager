import Notification from "./Notification.js";

export function findByUser(userId) {
  return Notification.find({ user: userId }).sort({ created_at: -1 });
}
