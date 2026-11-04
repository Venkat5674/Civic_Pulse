import { describe, it, expect } from 'vitest';
import {
  calculateDistanceKm,
  calculateTextSimilarity,
  findDuplicateCandidates,
} from '../services/duplicateDetectionService';

describe('Duplicate Detection Engine', () => {
  it('should calculate accurate geographical distance between lat/lng points', () => {
    // Distance between same coordinates should be 0
    const zeroDist = calculateDistanceKm(37.7749, -122.4194, 37.7749, -122.4194);
    expect(zeroDist).toBeCloseTo(0, 2);

    // Distance between nearby coordinates (approx 0.5 km)
    const dist = calculateDistanceKm(37.7749, -122.4194, 37.7790, -122.4140);
    expect(dist).toBeGreaterThan(0.1);
    expect(dist).toBeLessThan(2.0);
  });

  it('should calculate text token similarity correctly', () => {
    const simHigh = calculateTextSimilarity('Hazardous deep pothole on Main St', 'Deep pothole hazard on Main Street');
    const simLow = calculateTextSimilarity('Water main leak overflowing sidewalk', 'Streetlight broken dark lamp');

    expect(simHigh).toBeGreaterThan(0.3);
    expect(simLow).toBeLessThan(0.1);
  });

  it('should flag duplicate candidate when distance, category and text match closely', () => {
    const newReport = {
      id: 'iss-new',
      categoryId: 'cat-1',
      title: 'Hazardous deep pothole on 4th Ave',
      description: 'A deep pothole in right lane damaging tires',
      latitude: 37.774929,
      longitude: -122.419416,
    };

    const existingList = [
      {
        id: 'iss-101',
        categoryId: 'cat-1',
        title: 'Hazardous deep pothole on 4th Ave near Main St',
        description: 'A very deep pothole roughly 2 feet wide',
        latitude: 37.774930,
        longitude: -122.419420,
        status: 'IN_PROGRESS',
      },
    ];

    const candidates = findDuplicateCandidates(newReport, existingList);
    expect(candidates.length).toBe(1);
    expect(candidates[0].totalScore).toBeGreaterThanOrEqual(60);
    expect(candidates[0].confidenceLevel).toBe('HIGH');
  });
});
