const issueService = require('../services/issueService');
const commentService = require('../services/commentService');
const { sendSuccess } = require('../utils/apiResponse');

async function addComment(req, res, next) {
  try {
    const comment = await issueService.addComment(req.params.id, req.body.body, req.user);
    return sendSuccess(res, comment, 'Comment added successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function getCommentById(req, res, next) {
  try {
    const comment = await commentService.getCommentById(req.params.id);
    return res.status(200).json(comment);
  } catch (err) {
    next(err);
  }
}

async function updateComment(req, res, next) {
  try {
    const comment = await commentService.updateComment(req.params.id, req.body.body, req.user);
    return sendSuccess(res, comment, 'Comment updated successfully');
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const result = await commentService.deleteComment(req.params.id, req.user);
    return sendSuccess(res, result, 'Comment deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addComment,
  getCommentById,
  updateComment,
  deleteComment,
};
