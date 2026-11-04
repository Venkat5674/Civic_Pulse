const { calculatePriorityScore } = require('../src/services/priorityScoringService');
const { calculateDistanceKm } = require('../src/utils/distanceCalculator');
const { calculateTextSimilarity } = require('../src/utils/textSimilarity');

describe('CivicPulse Business Rule Algorithms', () => {
  it('calculatePriorityScore - should correctly compute score based on severity, confirmations, and category weight', () => {
    const scoreLow = calculatePriorityScore({
      severity: 'LOW',
      confirmationsCount: 1,
      categoryWeight: 1.0,
      createdAt: new Date(),
    });
    expect(scoreLow).toBeGreaterThanOrEqual(15);

    const scoreCritical = calculatePriorityScore({
      severity: 'CRITICAL',
      confirmationsCount: 10,
      categoryWeight: 1.5,
      createdAt: new Date(),
    });
    expect(scoreCritical).toBeGreaterThan(scoreLow);
    expect(scoreCritical).toBeLessThanOrEqual(100);
  });

  it('calculateDistanceKm - should accurately compute distance between two lat/lng pairs', () => {
    // Distance between two points in NYC (~0.2 km)
    const dist = calculateDistanceKm(40.7128, -74.006, 40.7145, -74.0082);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(1.0);
  });

  it('calculateTextSimilarity - should return high Jaccard score for similar descriptions', () => {
    const text1 = 'Deep pothole on Main Street near 5th avenue';
    const text2 = 'Large pothole on Main Street near fifth avenue';
    const sim = calculateTextSimilarity(text1, text2);
    expect(sim).toBeGreaterThan(0.5);
  });
});
