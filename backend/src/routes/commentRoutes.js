const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { validateBody } = require('../middleware/validate');
const { commentSchema } = require('../validators/issueValidators');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

router.get('/:id', optionalAuth, commentController.getCommentById);
router.patch('/:id', authenticateToken, validateBody(commentSchema), commentController.updateComment);
router.delete('/:id', authenticateToken, commentController.deleteComment);

module.exports = router;
