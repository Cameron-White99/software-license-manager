const UserRepository = require('./UserRepository');
const UserFacade = require('./UserFacade');
const PasswordService = require('../auth/PasswordService');
const TokenService = require('../auth/TokenService');
const { isValidEmail } = require('../utils/Validation');
const { createError } = require('../middleware/ErrorMiddleware');

async function list() {
  return UserRepository.findAll();
}

async function create(body) {
  const fullName = String(body.full_name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const role = body.role || 'user';
  const status = body.status || 'active';

  if (!fullName) throw createError('Full name is required.');
  if (!isValidEmail(email)) throw createError('Enter a valid email address.');
  if (!['user', 'admin'].includes(role)) throw createError('Role must be user or admin.');
  if (!['active', 'blocked'].includes(status)) throw createError('Status must be active or blocked.');

  const existing = await UserRepository.findByEmail(email);
  if (existing) throw createError('An account with this email already exists.');

  const user = await UserRepository.create({
    full_name: fullName,
    email,
    password_hash: await PasswordService.hash(PasswordService.TEMP_PASSWORD),
    role,
    status,
  });
  return TokenService.publicUser(user);
}

async function update(id, body, actor) {
  const fullName = String(body.full_name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const { role, status } = body;

  if (!fullName) throw createError('Full name is required.');
  if (!isValidEmail(email)) throw createError('Enter a valid email address.');
  if (role && !['user', 'admin'].includes(role)) throw createError('Role must be user or admin.');
  if (status && !['active', 'blocked'].includes(status)) throw createError('Status must be active or blocked.');

  const user = await UserRepository.findById(id);
  if (!user) throw createError('User not found.', 404);

  const editingSelf = actor._id.equals(user._id);
  if (editingSelf && ((role && role !== user.role) || (status && status !== user.status))) {
    throw createError('You cannot change your own role or status.');
  }

  const existing = await UserRepository.findByEmailExcluding(email, user._id);
  if (existing) throw createError('An account with this email already exists.');

  user.full_name = fullName;
  user.email = email;
  if (role) user.role = role;
  if (status) user.status = status;
  await UserRepository.save(user);
  return TokenService.publicUser(user);
}

async function updateStatus(id, status, actor) {
  if (!['active', 'blocked'].includes(status)) throw createError('Status must be active or blocked.');
  if (actor._id.equals(id) && status === 'blocked') throw createError('You cannot block your own account.');

  const user = await UserRepository.updateStatus(id, status);
  if (!user) throw createError('User not found.', 404);
  return user;
}

function remove(id, actor) {
  return UserFacade.deleteAccount(id, actor);
}

async function updateMe(user, body) {
  const fullName = String(body.full_name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  if (!fullName) throw createError('Full name is required.');
  if (!isValidEmail(email)) throw createError('Enter a valid email address.');

  const existing = await UserRepository.findByEmailExcluding(email, user._id);
  if (existing) throw createError('An account with this email already exists.');

  user.full_name = fullName;
  user.email = email;
  await UserRepository.save(user);
  return TokenService.publicUser(user);
}

async function updatePassword(user, body) {
  const current = body.current_password || '';
  const nextPassword = body.new_password || '';
  const confirm = body.confirm_password || '';

  const match = await PasswordService.compare(current, user.password_hash);
  if (!match) throw createError('Current password is incorrect.');

  const passwordError = PasswordService.validate(nextPassword);
  if (passwordError) throw createError(passwordError);
  if (nextPassword !== confirm) throw createError('Passwords do not match.');

  user.password_hash = await PasswordService.hash(nextPassword);
  await UserRepository.save(user);
  return { message: 'Password updated.' };
}

module.exports = { list, create, update, updateStatus, remove, updateMe, updatePassword };
