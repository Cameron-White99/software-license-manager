
import { api } from '../api.js';

/**
 * SLM-162: Fetch software versions available for feedback.
 */
export async function fetchFeedbackVersions() {
  const response = await api('/api/versions');

  return Array.isArray(response)
    ? response
    : response.data;
}

/**
 * SLM-162: Submit feedback for a software version.
 */
export async function submitFeedback({ versionId, rating, comments }) {
  const response = await api('/api/feedback', {
    method: 'POST',
    body: {
      versionId,
      rating,
      comments
    }
  });

  return response.data;
}

/**
 * SLM-163: Fetch feedback history of the logged-in user.
 */
export async function fetchMyFeedback() {
  const response = await api('/api/feedback/my');

  return response.data;
}
