import FeedbackFacade from './FeedbackFacade.js';

function createFeedback(userId, data) {
  return FeedbackFacade.submit(userId, data);
}

function getMyFeedback(userId) {
  return FeedbackFacade.listForUser(userId);
}

function getSoftwareFeedback(softwareId) {
  return FeedbackFacade.listForSoftware(softwareId);
}

export default {
  createFeedback,
  getMyFeedback,
  getSoftwareFeedback,
};
