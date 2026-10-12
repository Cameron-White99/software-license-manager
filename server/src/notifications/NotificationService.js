import NotificationRepository from "./NotificationRepository.js";

export function listForUser(userId) {
  return NotificationRepository.findByUser(userId);
}