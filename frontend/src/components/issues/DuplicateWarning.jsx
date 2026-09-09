import React from 'react';
import { AlertTriangle, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function DuplicateWarning({ candidates = [], onProceedAnyway }) {
  if (!candidates || candidates.length === 0) return null;

  const topMatch = candidates[0];

  return (
    <div className="border border-amber-300 rounded-xl bg-amber-50/80 p-5 space-y-4 shadow-sm animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900">
            Possible Duplicate Issue Detected ({topMatch.confidenceLevel} Match Confidence)
          </h4>
          <p className="text-xs text-amber-800 leading-relaxed">
            Our smart system detected an active report in the immediate area that may describe the same problem. Confirming an existing report increases its priority score faster than creating a duplicate!
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {candidates.slice(0, 2).map((item) => (
          <div
            key={item.candidateIssue.id}
            className="p-3.5 bg-white rounded-lg border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {item.totalScore}% Match
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {item.distanceKm} km away
                </span>
              </div>
              <h5 className="text-sm font-bold text-slate-900 line-clamp-1">
                {item.candidateIssue.title}
              </h5>
              <p className="text-xs text-slate-600 line-clamp-1">
                {item.candidateIssue.address}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <Link
                to={`/issues/${item.candidateIssue.id}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-md transition"
              >
                <span>View & Confirm</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-amber-200/60">
        <p className="text-xs text-amber-800 italic">
          If your issue is completely different, you can proceed with submission below.
        </p>
        {onProceedAnyway && (
          <Button onClick={onProceedAnyway} variant="outline" size="sm">
            Continue Submitting New Report
          </Button>
        )}
      </div>
    </div>
  );
}
