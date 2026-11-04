import { describe, it, expect } from 'vitest';
import {
  calculatePriorityScore,
  getPriorityLevel,
  SEVERITY_BASE_SCORES,
} from '../services/priorityScoringService';

describe('Priority Scoring Engine', () => {
  it('should return higher score for critical severity than low severity', () => {
    const low = calculatePriorityScore({ severity: 'LOW' });
    const critical = calculatePriorityScore({ severity: 'CRITICAL' });
    expect(critical).toBeGreaterThan(low);
  });

  it('should boost score with citizen confirmations', () => {
    const score0 = calculatePriorityScore({ severity: 'MEDIUM', confirmationsCount: 0 });
    const score5 = calculatePriorityScore({ severity: 'MEDIUM', confirmationsCount: 5 });
    expect(score5).toBeGreaterThan(score0);
  });

  it('should correctly map scores to qualitative priority levels', () => {
    expect(getPriorityLevel(90)).toBe('CRITICAL');
    expect(getPriorityLevel(70)).toBe('HIGH');
    expect(getPriorityLevel(45)).toBe('MEDIUM');
    expect(getPriorityLevel(20)).toBe('LOW');
  });
});
