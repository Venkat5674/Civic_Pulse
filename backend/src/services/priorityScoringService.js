const SEVERITY_BASE_SCORES = {
  LOW: 15,
  MEDIUM: 35,
  HIGH: 60,
  CRITICAL: 85,
};

/**
 * Computes a priority score (1 to 100) based on severity, confirmations, category weight, and report age.
 */
function calculatePriorityScore({
  severity = 'MEDIUM',
  confirmationsCount = 1,
  categoryWeight = 1.0,
  createdAt = new Date(),
}) {
  const baseSeverity = SEVERITY_BASE_SCORES[severity.toUpperCase()] || 35;

  // Confirmation bonus (+4 pts per confirmation, max 20 pts)
  const confirmationBonus = Math.min(confirmationsCount * 4, 20);

  // Age factor: +1 point per full day (max 10 pts)
  const createdDate = new Date(createdAt);
  const daysOld = Math.max(0, Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24)));
  const ageBonus = Math.min(daysOld * 1, 10);

  // Weighted raw score
  const rawScore = (baseSeverity + confirmationBonus + ageBonus) * (categoryWeight || 1.0);

  // Normalize between 1 and 100
  return Math.min(100, Math.max(1, Math.round(rawScore)));
}

/**
 * Maps numeric priority score to qualitative level.
 */
function getPriorityLevel(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 35) return 'MEDIUM';
  return 'LOW';
}

module.exports = {
  SEVERITY_BASE_SCORES,
  calculatePriorityScore,
  getPriorityLevel,
};
