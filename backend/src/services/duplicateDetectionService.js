const { calculateDistanceKm } = require('../utils/distanceCalculator');
const { calculateTextSimilarity } = require('../utils/textSimilarity');
const prisma = require('../config/db');

/**
 * Finds candidate duplicates for a new issue against active issues in database.
 */
async function findDuplicateCandidates(newReport, excludeIssueId = null) {
  if (!newReport || !newReport.latitude || !newReport.longitude) return [];

  // Query active issues (not REJECTED or RESOLVED)
  const activeIssues = await prisma.issue.findMany({
    where: {
      id: excludeIssueId ? { not: excludeIssueId } : undefined,
      status: { notIn: ['REJECTED', 'RESOLVED'] },
    },
    include: {
      category: true,
      images: true,
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  const candidates = activeIssues
    .map((existing) => {
      // 1. Distance Signal (Max 40 pts)
      const distKm = calculateDistanceKm(
        Number(newReport.latitude),
        Number(newReport.longitude),
        Number(existing.latitude),
        Number(existing.longitude)
      );

      let distanceScore = 0;
      if (distKm <= 0.05) distanceScore = 40;       // < 50 meters
      else if (distKm <= 0.15) distanceScore = 32;  // < 150 meters
      else if (distKm <= 0.4) distanceScore = 20;   // < 400 meters
      else if (distKm <= 1.0) distanceScore = 10;   // < 1 km

      // 2. Category Match Signal (Max 30 pts)
      const categoryScore = newReport.categoryId === existing.categoryId ? 30 : 0;

      // 3. Text Similarity Signal (Max 30 pts)
      const titleSim = calculateTextSimilarity(newReport.title, existing.title);
      const descSim = calculateTextSimilarity(newReport.description, existing.description);
      const combinedTextSim = titleSim * 0.7 + descSim * 0.3;
      const textScore = Math.round(combinedTextSim * 30);

      const totalScore = distanceScore + categoryScore + textScore;

      let confidenceLevel = 'LOW';
      if (totalScore >= 75) confidenceLevel = 'HIGH';
      else if (totalScore >= 50) confidenceLevel = 'MEDIUM';

      return {
        candidateIssue: {
          id: existing.id,
          title: existing.title,
          description: existing.description,
          status: existing.status,
          severity: existing.severity,
          latitude: existing.latitude,
          longitude: existing.longitude,
          address: existing.address,
          categoryName: existing.category.name,
          userName: existing.user.name,
          createdAt: existing.createdAt,
        },
        distanceKm: Math.round(distKm * 100) / 100,
        distanceScore,
        categoryScore,
        textScore,
        totalScore,
        confidenceLevel,
      };
    })
    .filter((candidate) => candidate.totalScore >= 40)
    .sort((a, b) => b.totalScore - a.totalScore);

  return candidates;
}

module.exports = {
  findDuplicateCandidates,
};
