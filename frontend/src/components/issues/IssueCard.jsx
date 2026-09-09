import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, MessageSquare, Image as ImageIcon, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { PriorityIndicator } from './PriorityIndicator';
import { issueService } from '../../services/issueService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export function IssueCard({ issue, onUpdate }) {
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(issue.userConfirmed);
  const [count, setCount] = useState(issue.confirmationsCount || 0);

  const handleConfirmToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in as a citizen to confirm this report.');
      return;
    }

    setConfirming(true);
    try {
      if (confirmed) {
        await issueService.unconfirmIssue(issue.id, user);
        setConfirmed(false);
        setCount((prev) => Math.max(0, prev - 1));
        toast.info('Confirmation removed.');
      } else {
        await issueService.confirmIssue(issue.id, user);
        setConfirmed(true);
        setCount((prev) => prev + 1);
        toast.success('Confirmed! Your support boosts this issue priority.');
      }
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle confirmation');
    } finally {
      setConfirming(false);
    }
  };

  const primaryImage = issue.images && issue.images.length > 0 ? issue.images[0].imageUrl : null;
  const createdAgo = issue.createdAt
    ? formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })
    : 'recently';

  return (
    <div className="group bg-white rounded-xl border border-slate-200 shadow-subtle hover:shadow-card hover:border-slate-300 transition duration-200 overflow-hidden flex flex-col">
      {/* Image Banner if available */}
      {primaryImage && (
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          <img
            src={primaryImage}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <StatusBadge status={issue.status} />
          </div>
          {issue.images.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-xs">
              <ImageIcon className="w-3.5 h-3.5" />
              +{issue.images.length - 1} photos
            </span>
          )}
        </div>
      )}

      {/* Card Header & Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {!primaryImage && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <StatusBadge status={issue.status} />
              <PriorityIndicator score={issue.priorityScore} />
            </div>
          )}

          {primaryImage && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                {issue.categoryName}
              </span>
              <PriorityIndicator score={issue.priorityScore} />
            </div>
          )}

          {!primaryImage && (
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full inline-block mb-2">
              {issue.categoryName}
            </span>
          )}

          <Link to={`/issues/${issue.id}`} className="block">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition line-clamp-2">
              {issue.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{issue.address || 'Metro City Area'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <img
                src={issue.userAvatar}
                alt={issue.userName}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="truncate max-w-[120px] font-medium text-slate-700">{issue.userName}</span>
              <span className="text-slate-400">• {createdAgo}</span>
            </div>

            {/* Confirm issue button */}
            <button
              onClick={handleConfirmToggle}
              disabled={confirming}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                confirmed
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Confirm that you also experience or see this issue"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${confirmed ? 'fill-brand-600 text-brand-600' : ''}`} />
              <span>{count}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
