const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const confirmationController = require('../controllers/confirmationController');
const commentController = require('../controllers/commentController');
const { validateBody } = require('../middleware/validate');
const { createIssueSchema, updateIssueSchema, cancelIssueSchema, commentSchema } = require('../validators/issueValidators');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public & Optional Auth routes
router.get('/', optionalAuth, issueController.getIssues);
router.get('/nearby', issueController.getNearbyIssues);
router.get('/:id', optionalAuth, issueController.getIssueById);
router.get('/:id/duplicates', issueController.getIssueDuplicates);

// Protected routes (Requires Auth)
router.post('/', authenticateToken, validateBody(createIssueSchema), issueController.createIssue);
router.patch('/:id', authenticateToken, validateBody(updateIssueSchema), issueController.updateIssue);
router.post('/:id/cancel', authenticateToken, validateBody(cancelIssueSchema), issueController.cancelIssue);
router.delete('/:id', authenticateToken, issueController.deleteIssue);
router.post('/:id/confirm', authenticateToken, confirmationController.confirmIssue);
router.delete('/:id/confirm', authenticateToken, confirmationController.unconfirmIssue);
router.post('/:id/comments', authenticateToken, validateBody(commentSchema), commentController.addComment);

module.exports = router;

