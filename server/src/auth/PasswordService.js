import bcrypt from 'bcryptjs';
import { checkPassword } from '../utils/Validation.js';

const TEMP_PASSWORD = 'Password123';

function hash(password) {
  return bcrypt.hash(password, 10);
}

function compare(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function validate(password) {
  return checkPassword(password);
}

export default {
  hash,
  compare,
  validate,
  TEMP_PASSWORD
};
