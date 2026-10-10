import * as LicenseRepository from './LicenseRepository.js';

export function listForUser(userId) {
  return LicenseRepository.findByUser(userId);
}
