const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const upload = require('../middleware/upload');
const { optionalAuth } = require('../middleware/auth');

router.post('/analyze-photo', optionalAuth, upload.single('image'), aiController.analyzePhoto);

module.exports = router;
