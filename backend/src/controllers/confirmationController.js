const issueService = require('../services/issueService');
const { sendSuccess } = require('../utils/apiResponse');

async function confirmIssue(req, res, next) {
  try {
    const updated = await issueService.confirmIssue(req.params.id, req.user);
    return sendSuccess(res, updated, 'Issue confirmed successfully');
  } catch (err) {
    next(err);
  }
}

async function unconfirmIssue(req, res, next) {
  try {
    const updated = await issueService.unconfirmIssue(req.params.id, req.user);
    return sendSuccess(res, updated, 'Issue confirmation removed');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  confirmIssue,
  unconfirmIssue,
};
