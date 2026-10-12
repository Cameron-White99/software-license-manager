import * as SoftwareRepository from './SoftwareRepository.js';
import { createError } from '../middleware/ErrorMiddleware.js';

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


export { create, update };
