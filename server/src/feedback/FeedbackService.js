import FeedbackFacade from './FeedbackFacade.js';

function createFeedback(userId, data) {
  return FeedbackFacade.submit(userId, data);
}

function getMyFeedback(userId) {
  return FeedbackFacade.listForUser(userId);
}

export default {
  createFeedback,
  getMyFeedback,
};
