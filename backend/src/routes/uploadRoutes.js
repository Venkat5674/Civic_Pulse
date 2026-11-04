const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, upload.single('image'), upload.requireLiveCameraCapture, uploadController.uploadImage);

module.exports = router;
