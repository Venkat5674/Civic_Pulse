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
    <div className="group bg-white/90 dark:bg-[#120d24]/90 backdrop-blur-md rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image Banner if available */}
      {primaryImage && (
        <div className="relative h-44 w-full bg-purple-50 dark:bg-purple-950/40 overflow-hidden">
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
            <span className="absolute bottom-3 right-3 bg-slate-900/80 dark:bg-purple-950/90 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-xs">
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
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/80 px-2.5 py-0.5 rounded-full border border-violet-200/50 dark:border-violet-800/50">
                {issue.categoryName}
              </span>
              <PriorityIndicator score={issue.priorityScore} />
            </div>
          )}

          {!primaryImage && (
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/80 px-2.5 py-0.5 rounded-full inline-block mb-2 border border-violet-200/50 dark:border-violet-800/50">
              {issue.categoryName}
            </span>
          )}

          <Link to={`/issues/${issue.id}`} className="block">
            <h3 className="text-base font-bold text-purple-950 dark:text-purple-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition line-clamp-2">
              {issue.title}
            </h3>
          </Link>

          <p className="text-xs text-purple-800/70 dark:text-purple-300/70 mt-1.5 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        <div className="space-y-3 pt-3 border-t border-purple-100 dark:border-purple-900/30">
          <div className="flex items-center gap-1.5 text-xs text-purple-700/80 dark:text-purple-300/70">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
            <span className="truncate">{issue.address || 'Metro City Area'}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-purple-700/80 dark:text-purple-300/70 pt-1">
            <div className="flex items-center gap-2">
              <img
                src={issue.userAvatar}
                alt={issue.userName}
                className="w-5 h-5 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800"
              />
              <span className="truncate max-w-[120px] font-medium text-purple-950 dark:text-purple-200">{issue.userName}</span>
              <span className="text-purple-400 dark:text-purple-500">• {createdAgo}</span>
            </div>

            {/* Confirm issue button */}
            <button
              onClick={handleConfirmToggle}
              disabled={confirming}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                confirmed
                  ? 'bg-violet-100 text-violet-800 border border-violet-300 dark:bg-violet-950/80 dark:text-violet-200 dark:border-violet-700'
                  : 'bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-900 dark:text-purple-200 border border-purple-200/60 dark:border-purple-800/40'
              }`}
              title="Confirm that you also experience or see this issue"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${confirmed ? 'fill-violet-600 text-violet-600 dark:fill-violet-400 dark:text-violet-400' : ''}`} />
              <span>{count}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
