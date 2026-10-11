
function create(type, data) {
  const userId = data.userId;
  const softwareName = data.softwareName || 'Software';

  let message;

  switch (type) {
    case 'request':
      message = `${data.fullName || 'A user'} requested a license for ${softwareName}.`;
      break;

    case 'Approved':
      message = `Your license request for ${softwareName} has been approved.`;
      break;

    case 'Rejected':
      message = `Your license request for ${softwareName} has been rejected.`;
      break;

    case 'Expired':
      message = `Your license for ${softwareName} has expired or been revoked.`;
      break;

    case 'cancelled':
      message = `Your license for ${softwareName} has been cancelled.`;
      break;

    default:
      message = `There is an update regarding ${softwareName}.`;
  }

  return {
    user: userId,
    message,
    read_at: false
  };
}

export default {
  create
};
