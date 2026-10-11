import jwt from 'jsonwebtoken';
import PublicUserAdapter from './PublicUserAdapter.js';

function secret() {
  return process.env.JWT_SECRET || 'sl_assessment_dev_secret';
}

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, secret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
}

function verify(token) {
  return jwt.verify(token, secret());
}

function publicUser(user) {
  return PublicUserAdapter.toPublic(user);
}

export { signToken, verify, publicUser };
