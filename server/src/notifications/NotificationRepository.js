import Notification from "./Notification.js";

function findByUser(userId) {
  return Notification.find({ user: userId }).sort({ created_at: -1 });
}
function create(data) {
  return Notification.create(data);
}
function insertMany(docs) {
  return Notification.insertMany(docs);
}

export default {
  findByUser,
  create,
  insertMany,
};