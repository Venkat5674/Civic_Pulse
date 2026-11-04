import { apiClient } from './api';

export const aiService = {
  /**
   * Analyzes an issue evidence image file or URL using Gemini 1.5 Flash Vision.
   */
  async analyzePhoto(fileOrUrl) {
    try {
      if (typeof fileOrUrl === 'string') {
        const response = await apiClient.post('/ai/analyze-photo', {
          imageUrl: fileOrUrl,
        });
        return response.data;
      }

      const formData = new FormData();
      formData.append('image', fileOrUrl);

      const response = await apiClient.post('/ai/analyze-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (err) {
      console.warn('AI photo analysis API error:', err.response?.data || err.message);
      // Graceful fallback
      return {
        success: false,
        isAiPowered: false,
        error: err.response?.data?.message || err.message,
      };
    }
  },
};
