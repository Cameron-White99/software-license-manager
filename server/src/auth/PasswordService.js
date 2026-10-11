import bcrypt from 'bcrypt';
import { checkPassword } from '../utils/Validation';

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

module.exports = { hash, compare, validate, TEMP_PASSWORD };
