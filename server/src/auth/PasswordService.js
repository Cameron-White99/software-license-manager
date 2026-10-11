
import bcrypt from 'bcryptjs';
import { checkPassword } from '../utils/Validation.js';

const TEMP_PASSWORD = 'Password123';

// Hash user password
function hash(password) {
  return bcrypt.hash(password, 10);
}

// Compare entered password with stored hash
function compare(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

// Validate password
function validate(password) {
  return checkPassword(password);
}

export {
  hash,
  compare,
  validate,
  TEMP_PASSWORD
};
