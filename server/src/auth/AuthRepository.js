import UserRepository from '../users/UserRepository.js';

function findByEmail(email) {
  return UserRepository.findByEmail(email);
}

function create(data) {
  return UserRepository.create(data);
}

function save(user) {
  return UserRepository.save(user);
}

export default {
  findByEmail,
  create,
  save
};
