const Auth = require('./Auth');
const AuthRepository = require('./AuthRepository');
const PasswordService = require('./PasswordService');
const TokenService = require('./TokenService');
const EmailService = require('../utils/EmailService');
const { isValidEmail } = require('../utils/Validation');
const { createError } = require('../middleware/ErrorMiddleware');

async function register(body) {
  const fullName = String(body.full_name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = body.password || '';
  const confirm = body.confirm_password || '';

  if (!fullName) throw createError('Full name is required.');
  if (!isValidEmail(email)) throw createError('Enter a valid email address.');
  const passwordError = PasswordService.validate(password);
  if (passwordError) throw createError(passwordError);
  if (password !== confirm) throw createError('Passwords do not match.');

  const existing = await AuthRepository.findByEmail(email);
  if (existing) throw createError('An account with this email already exists.');

  const user = await AuthRepository.create({
    full_name: fullName,
    email,
    password_hash: await PasswordService.hash(password),
    role: 'user',
    status: 'active',
  });

  return new Auth(TokenService.signToken(user), TokenService.publicUser(user));
}

async function login(body) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = body.password || '';
  if (!email || !password) throw createError('Email and password are required.');

  const user = await AuthRepository.findByEmail(email);
  if (!user) throw createError('Incorrect email or password.', 401);
  if (user.status === 'blocked') throw createError('This account is blocked.', 403);

  const match = await PasswordService.compare(password, user.password_hash);
  if (!match) throw createError('Incorrect email or password.', 401);

  return new Auth(TokenService.signToken(user), TokenService.publicUser(user));
}

async function forgotPassword(body) {
  const email = String(body.email || '').trim().toLowerCase();
  const newPassword = body.new_password || '';
  const confirm = body.confirm_password || '';

  if (!isValidEmail(email)) throw createError('Enter a valid email address.');

  const user = await AuthRepository.findByEmail(email);
  if (!user) throw createError('No account found with that email.', 404);
  if (user.status === 'blocked') throw createError('This account is blocked.', 403);

  if (!newPassword) return { exists: true, message: EmailService.accountFound() };

  const passwordError = PasswordService.validate(newPassword);
  if (passwordError) throw createError(passwordError);
  if (newPassword !== confirm) throw createError('Passwords do not match.');

  user.password_hash = await PasswordService.hash(newPassword);
  await AuthRepository.save(user);
  return { message: EmailService.passwordUpdated() };
}

function currentUser(user) {
  return TokenService.publicUser(user);
}

module.exports = { register, login, forgotPassword, currentUser };
