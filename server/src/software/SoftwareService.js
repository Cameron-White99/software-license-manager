import SoftwareRepository from './SoftwareRepository.js';
import VersionRepository from '../versions/VersionRepository.js';
import { createError } from '../middleware/ErrorMiddleware.js';

async function withLatestVersion(items) {
  const ids = items.map((item) => item._id);
  const versions = await VersionRepository.findBySoftwareIds(ids);
  const latest = new Map();
  versions.forEach((version) => {
    const key = String(version.software);
    if (!latest.has(key)) latest.set(key, version);
  });
  return items.map((item) => ({
    ...item.toObject(),
    latest_version: latest.get(String(item._id)) || null,
  }));
}

async function list() {
  const items = await SoftwareRepository.findActive();
  return withLatestVersion(items);
}

async function getById(id) {
  const software = await SoftwareRepository.findActiveById(id);
  if (!software) throw createError('Software not found.', 404);
  const versions = await VersionRepository.findBySoftware(software._id);
  return { ...software.toObject(), versions, latest_version: versions[0] || null };
}

async function create(body) {
  const name = String(body.software_name || '').trim();
  if (!name) throw createError('Software name is required.');
  const existing = await SoftwareRepository.findActiveByName(name);
  if (existing) throw createError('That software name already exists.');
  return SoftwareRepository.create({ software_name: name });
}

async function update(id, body) {
  const name = String(body.software_name || '').trim();
  if (!name) throw createError('Software name is required.');

  const software = await SoftwareRepository.findActiveById(id);
  if (!software) throw createError('Software not found.', 404);

  const existing = await SoftwareRepository.findActiveByNameExcluding(name, software._id);
  if (existing) throw createError('That software name already exists.');

  software.software_name = name;
  await SoftwareRepository.save(software);
  return software;
}

async function remove(id) {
  const software = await SoftwareRepository.findActiveById(id);
  if (!software) throw createError('Software not found.', 404);
  software.deleted_at = new Date();
  await SoftwareRepository.save(software);
  return { message: 'Software removed.' };
}

export default { list, getById, create, update, remove };
