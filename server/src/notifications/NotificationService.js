import { findByUser } from "./NotificationRepository.js";

export function listForUser(userId) {
  return findByUser(userId);
}
