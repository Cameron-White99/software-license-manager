import VersionRepository from './VersionRepository.js';
import SoftwareRepository from '../software/SoftwareRepository.js';
import LicenseRepository from '../licenses/LicenseRepository.js';
import { createError } from '../middleware/ErrorMiddleware.js';

async function list() {
  const versions = await VersionRepository.findAllWithSoftware();
  return versions.filter((version) => version.software && !version.software.deleted_at);
}

async function create(body) {
  const softwareId = body.software;
  const versionNumber = String(body.version_number || '').trim();
  const releaseNotes = String(body.release_notes || '').trim();
  const releaseDate = body.release_date;

  if (!softwareId || !versionNumber || !releaseNotes || !releaseDate) {
    throw createError('Software, version, release date, and release notes are required.');
  }

  const software = await SoftwareRepository.findActiveById(softwareId);
  if (!software) throw createError('Software not found.', 404);

  const existing = await VersionRepository.findByVersionNumber(versionNumber);
  if (existing) throw createError('That version number is already in use.');

  const version = await VersionRepository.create({
    software: softwareId,
    version_number: versionNumber,
    release_notes: releaseNotes,
    release_date: new Date(releaseDate),
  });
  return version.populate('software', 'software_name');
}

async function remove(id) {
  const inUse = await LicenseRepository.existsForVersion(id);
  if (inUse) throw createError('This version is used by a license and cannot be deleted.');
  const version = await VersionRepository.deleteById(id);
  if (!version) throw createError('Version not found.', 404);
  return { message: 'Version deleted.' };
}

export default { list, create, remove };