// Transparent rule-based duplicate detection service for CivicPulse

/**
 * Calculates geographical distance in kilometers between two lat/lng pairs using the Haversine formula.
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates text similarity score (0 to 1) based on word token overlap (Jaccard similarity).
 */
export function calculateTextSimilarity(text1 = '', text2 = '') {
  const tokenize = (str) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

  const words1 = new Set(tokenize(text1));
  const words2 = new Set(tokenize(text2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  words1.forEach((word) => {
    if (words2.has(word)) intersection++;
  });

  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

/**
 * Detects duplicate candidates for a newly reported issue against existing active issues.
 * Returns array of matches with total similarity score and component breakdowns.
 */
export function findDuplicateCandidates(newReport, existingIssues = []) {
  if (!newReport) return [];

  const candidates = existingIssues
    .filter((issue) => issue.id !== newReport.id && issue.status !== 'REJECTED' && issue.status !== 'RESOLVED')
    .map((existing) => {
      // 1. Distance Signal (Max 40 points)
      const distKm = calculateDistanceKm(
        newReport.latitude,
        newReport.longitude,
        existing.latitude,
        existing.longitude
      );

      let distanceScore = 0;
      if (distKm <= 0.05) distanceScore = 40;       // < 50 meters
      else if (distKm <= 0.15) distanceScore = 32;  // < 150 meters
      else if (distKm <= 0.4) distanceScore = 20;   // < 400 meters
      else if (distKm <= 1.0) distanceScore = 10;   // < 1 km

      // 2. Category Match Signal (Max 30 points)
      const categoryScore = newReport.categoryId === existing.categoryId ? 30 : 0;

      // 3. Text Similarity Signal (Max 30 points)
      const titleSim = calculateTextSimilarity(newReport.title, existing.title);
      const descSim = calculateTextSimilarity(newReport.description, existing.description);
      const combinedTextSim = titleSim * 0.7 + descSim * 0.3;
      const textScore = Math.round(combinedTextSim * 30);

      const totalScore = distanceScore + categoryScore + textScore;

      let confidenceLevel = 'LOW';
      if (totalScore >= 75) confidenceLevel = 'HIGH';
      else if (totalScore >= 50) confidenceLevel = 'MEDIUM';

      return {
        candidateIssue: existing,
        distanceKm: Math.round(distKm * 100) / 100,
        distanceScore,
        categoryScore,
        textScore,
        totalScore,
        confidenceLevel,
      };
    })
    .filter((item) => item.totalScore >= 40)
    .sort((a, b) => b.totalScore - a.totalScore);

  return candidates;
}
