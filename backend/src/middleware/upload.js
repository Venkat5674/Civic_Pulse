const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
});

function requireLiveCameraCapture(req, res, next) {
  const liveCapture = req.body?.isLiveCamera || req.headers['x-live-camera-capture'];
  const latitude = Number(req.body?.latitude || req.headers['x-capture-latitude']);
  const longitude = Number(req.body?.longitude || req.headers['x-capture-longitude']);
  const capturedAt = req.body?.capturedAt || req.headers['x-captured-at'];

  if (liveCapture !== true && liveCapture !== 'true') {
    return res.status(400).json({ success: false, message: 'Only live camera captures are accepted' });
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !capturedAt) {
    return res.status(400).json({ success: false, message: 'Live capture GPS coordinates and timestamp are required' });
  }

  req.liveCaptureMetadata = { latitude, longitude, capturedAt };
  return next();
}

module.exports = upload;
module.exports.requireLiveCameraCapture = requireLiveCameraCapture;
