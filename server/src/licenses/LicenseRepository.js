import License from './License.js';

function withDetails(query) {
  return query
    .populate('user', 'full_name email role')
    .populate('assigned_software', 'software_name')
    .populate('version_number', 'version_number')
    .sort({ requested_at: -1 });
}

export function findByUser(userId) {
  return withDetails(License.find({ user: userId }));
}
