import LicenseRepository from './LicenseRepository';
import { createError } from '../middleware/ErrorMiddleware';

function listForUser(userId) {
  return LicenseRepository.findByUser(userId);
}

function listAll() {
  return LicenseRepository.findAll();
}

async function remove(id) {
  const license = await LicenseRepository.deleteById(id);
  if (!license) throw createError('License not found.', 404);
  return { message: 'License deleted.' };
}

export default { listForUser, listAll, remove };