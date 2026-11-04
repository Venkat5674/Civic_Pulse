// Deterministic priority scoring algorithm for CivicPulse

export const SEVERITY_BASE_SCORES = {
  LOW: 15,
  MEDIUM: 35,
  HIGH: 60,
  CRITICAL: 85,
};

/**
 * Computes a priority score (0 to 100) based on severity, category weight, citizen confirmations, and report age.
 */
export function calculatePriorityScore({
  severity = 'MEDIUM',
  confirmationsCount = 0,
  categoryWeight = 1.0,
  createdAt = new Date().toISOString(),
}) {
  const baseSeverity = SEVERITY_BASE_SCORES[severity.toUpperCase()] || 35;
  
  // Confirmation bonus (+4 pts per citizen confirmation up to 20 pts max)
  const confirmationBonus = Math.min(confirmationsCount * 4, 20);

  // Age factor: +1 point for each full day open (max +10 pts)
  const daysOld = Math.max(0, Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)));
  const ageBonus = Math.min(daysOld * 1, 10);

  // Weighted raw calculation
  const rawScore = (baseSeverity + confirmationBonus + ageBonus) * (categoryWeight || 1.0);

  // Normalized score clamped between 1 and 100
  return Math.min(100, Math.max(1, Math.round(rawScore)));
}

/**
 * Maps a numeric priority score (1-100) to a qualitative priority level string.
 */
export function getPriorityLevel(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

/**
 * Returns Tailwind color classes for a priority badge.
 */
export function getPriorityBadgeColor(scoreOrLevel) {
  const level = typeof scoreOrLevel === 'number' ? getPriorityLevel(scoreOrLevel) : scoreOrLevel;

  switch (level) {
    case 'CRITICAL':
      return 'bg-rose-100 text-rose-800 border-rose-300 ring-rose-500/20';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-300 ring-orange-500/20';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800 border-amber-300 ring-amber-500/20';
    case 'LOW':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-500/20';
  }
}
