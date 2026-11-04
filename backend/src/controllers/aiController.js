const aiService = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

async function analyzePhoto(req, res, next) {
  try {
    let imageBuffer = null;
    let mimeType = 'image/jpeg';
    let imageUrl = req.body?.imageUrl;

    if (req.file) {
      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    } else if (req.body?.imageBase64) {
      const parts = req.body.imageBase64.split(',');
      const header = parts[0];
      const base64Str = parts[1] || parts[0];
      const match = header.match(/:(.*?);/);
      if (match) mimeType = match[1];
      imageBuffer = Buffer.from(base64Str, 'base64');
    }

    if (!imageBuffer && !imageUrl) {
      return sendError(res, 'Please provide an image file, imageBase64, or imageUrl for AI analysis', 400);
    }

    const analysis = await aiService.analyzeIssuePhoto({
      imageBuffer,
      mimeType,
      imageUrl,
    });

    return sendSuccess(
      res,
      {
        ...analysis,
        analysis,
      },
      'AI Photo triage analysis completed successfully'
    );
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyzePhoto,
};
