
import { api } from '../api.js';

// Fetch feedback submitted by the logged-in user.
export async function fetchMyFeedback() {
  return api('/api/feedback/mine');
}

// Submit feedback for a software version.
export async function submitFeedback({
  version,
  rating,
  comments
}) {
  return api('/api/feedback', {
    method: 'POST',
    body: {
      version,
      rating,
      comments
    }
  });
}

// Fetch feedback for a particular software.
// This endpoint is accessible to administrators only.
export async function fetchSoftwareFeedback(softwareId) {
  return api(
    `/api/feedback/software/${encodeURIComponent(softwareId)}`
  );
}
