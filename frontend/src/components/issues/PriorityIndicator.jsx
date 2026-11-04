import React from 'react';
import { getPriorityLevel, getPriorityBadgeColor } from '../../services/priorityScoringService';
import { Flame } from 'lucide-react';

export function PriorityIndicator({ score = 50, showScore = true }) {
  const level = getPriorityLevel(score);
  const colorClasses = getPriorityBadgeColor(score);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ring-1 ${colorClasses}`}
      title={`Calculated Priority Score: ${score}/100 (${level})`}
    >
      <Flame className="w-3.5 h-3.5" />
      <span>{level}</span>
      {showScore && <span className="opacity-75 font-mono">({score})</span>}
    </div>
  );
}
