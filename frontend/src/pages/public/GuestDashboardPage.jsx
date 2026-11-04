import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Bell,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Navigation,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Activity,
  Layers,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/issues/StatusBadge';
import { PriorityIndicator } from '../../components/issues/PriorityIndicator';
import { GuestReportIssueModal } from '../../components/modals/GuestReportIssueModal';

import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';
import { issueService } from '../../services/issueService';
import { calculateDistanceKm } from '../../services/duplicateDetectionService';

export function GuestDashboardPage() {
  const navigate = useNavigate();
  const { user, userLocation, openLocationPrompt } = useAuth();
  const { reloadData } = useIssues();

  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Persistent guest votes state from localStorage
  const [guestVotes, setGuestVotes] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpulse_guest_votes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Local state vote offsets
  const [voteOffsets, setVoteOffsets] = useState({});

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await issueService.getIssues({ limit: 100 });
      setAllIssues(res.items || []);
    } catch (err) {
      console.warn('Error fetching issues for guest dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const saveVote = (issueId, voteType) => {
    const updated = { ...guestVotes, [issueId]: voteType };
    setGuestVotes(updated);
    localStorage.setItem('civicpulse_guest_votes', JSON.stringify(updated));
  };

  const handleAccept = (e, issueId) => {
    e.preventDefault();
    e.stopPropagation();

    const currentVote = guestVotes[issueId];
    const prevOffset = voteOffsets[issueId] || { accepts: 0, rejects: 0 };

    if (currentVote === 'ACCEPT') {
      const { [issueId]: removed, ...rest } = guestVotes;
      setGuestVotes(rest);
      localStorage.setItem('civicpulse_guest_votes', JSON.stringify(rest));
      setVoteOffsets((prev) => ({
        ...prev,
        [issueId]: { ...prevOffset, accepts: prevOffset.accepts - 1 },
      }));
      toast.info('Removed acceptance.');
    } else {
      saveVote(issueId, 'ACCEPT');
      const rejectAdjustment = currentVote === 'REJECT' ? -1 : 0;
      setVoteOffsets((prev) => ({
        ...prev,
        [issueId]: {
          accepts: prevOffset.accepts + 1,
          rejects: prevOffset.rejects + rejectAdjustment,
        },
      }));
      toast.success('Accepted! Endorsed community solution.', { icon: '✅' });
    }
  };

  const handleReject = (e, issueId) => {
    e.preventDefault();
    e.stopPropagation();

    const currentVote = guestVotes[issueId];
    const prevOffset = voteOffsets[issueId] || { accepts: 0, rejects: 0 };

    if (currentVote === 'REJECT') {
      const { [issueId]: removed, ...rest } = guestVotes;
      setGuestVotes(rest);
      localStorage.setItem('civicpulse_guest_votes', JSON.stringify(rest));
      setVoteOffsets((prev) => ({
        ...prev,
        [issueId]: { ...prevOffset, rejects: prevOffset.rejects - 1 },
      }));
      toast.info('Removed rejection.');
    } else {
      saveVote(issueId, 'REJECT');
      const acceptAdjustment = currentVote === 'ACCEPT' ? -1 : 0;
      setVoteOffsets((prev) => ({
        ...prev,
        [issueId]: {
          accepts: prevOffset.accepts + acceptAdjustment,
          rejects: prevOffset.rejects + 1,
        },
      }));
      toast.error('Rejected! Flagged issue as inaccurate.', { icon: '❌' });
    }
  };

  // Distance calculation
  const guestLat = userLocation?.lat || 37.774929;
  const guestLng = userLocation?.lng || -122.419416;

  const augmentedIssues = allIssues.map((item) => {
    const dist = calculateDistanceKm(guestLat, guestLng, item.latitude, item.longitude);
    const offset = voteOffsets[item.id] || { accepts: 0, rejects: 0 };
    const baseConfirmations = item.confirmationsCount || 0;
    const baseRejects = Math.floor(baseConfirmations * 0.2);

    return {
      ...item,
      distanceKm: dist,
      acceptCount: Math.max(0, baseConfirmations + offset.accepts),
      rejectCount: Math.max(0, baseRejects + offset.rejects),
    };
  });

  // Calculate stats for KPI cards
  const guestSubmitted = augmentedIssues.filter(
    (i) => i.userId?.startsWith('guest') || i.userName?.toLowerCase().includes('guest')
  );

  const acceptedList = augmentedIssues.filter((i) => guestVotes[i.id] === 'ACCEPT');
  const rejectedList = augmentedIssues.filter((i) => guestVotes[i.id] === 'REJECT');

  // Interacted list: Issues guest raised OR accepted OR rejected
  const interactedIssues = augmentedIssues.filter(
    (i) =>
      guestVotes[i.id] ||
      i.userId?.startsWith('guest') ||
      i.userName?.toLowerCase().includes('guest')
  );

  // Fallback to top 4 nearby issues if guest has no interactions yet
  const displayFeed = interactedIssues.length > 0 ? interactedIssues : augmentedIssues.slice(0, 4);

  return (
    <AppShell>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 space-y-8">
        
        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-900/50 relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <div className="relative space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold border border-indigo-500/30">
              <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Guest Dashboard</span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3 h-3 text-brand-400" /> {userLocation?.cityName || 'Metro City Center'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome, {user?.name || 'Guest Visitor'}!
            </h1>

            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
              Track local infrastructure problems near your location, express Accept or Reject community consensus, and report new issues directly.
            </p>
          </div>

          <div className="relative shrink-0 flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
            <Button
              onClick={() => setIsReportModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold shadow-lg shadow-violet-500/20 rounded-2xl px-6"
              leftIcon={<PlusCircle className="w-5 h-5 text-white" />}
            >
              Raise an Issue as Guest
            </Button>
            <Button
              onClick={() => navigate('/guest')}
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold rounded-2xl"
              leftIcon={<Compass className="w-5 h-5 text-indigo-300" />}
            >
              Explore Nearby Map
            </Button>
          </div>
        </div>

        {/* 4 KPI Metric Cards (Matching Citizen Dashboard layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Accepted Problems (GREEN) */}
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card flex items-center justify-between transition-colors">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Accepted Problems</span>
              <span className="block text-3xl font-black text-purple-950 dark:text-white mt-1">{acceptedList.length}</span>
              <span className="text-[11px] font-medium text-purple-500 dark:text-purple-400">Endorsed in your area</span>
            </div>
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>

          {/* Card 2: Rejected Problems (RED) */}
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card flex items-center justify-between transition-colors">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">Rejected Problems</span>
              <span className="block text-3xl font-black text-purple-950 dark:text-white mt-1">{rejectedList.length}</span>
              <span className="text-[11px] font-medium text-purple-500 dark:text-purple-400">Flagged as inaccurate</span>
            </div>
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 rounded-2xl text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shadow-xs">
              <XCircle className="w-7 h-7" />
            </div>
          </div>

          {/* Card 3: Guest Submissions */}
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card flex items-center justify-between transition-colors">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-violet-600 dark:text-violet-400">Guest Submissions</span>
              <span className="block text-3xl font-black text-purple-950 dark:text-white mt-1">{guestSubmitted.length}</span>
              <span className="text-[11px] font-medium text-purple-500 dark:text-purple-400">Reported by you</span>
            </div>
            <div className="p-3.5 bg-violet-50 dark:bg-violet-950/50 rounded-2xl text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60 shadow-xs">
              <FileText className="w-7 h-7" />
            </div>
          </div>

          {/* Card 4: Nearby Problems */}
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card flex items-center justify-between transition-colors">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">Nearby Local Issues</span>
              <span className="block text-3xl font-black text-purple-950 dark:text-white mt-1">{allIssues.length}</span>
              <span className="text-[11px] font-medium text-purple-500 dark:text-purple-400">In {userLocation?.cityName || 'Active Region'}</span>
            </div>
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 rounded-2xl text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shadow-xs">
              <MapPin className="w-7 h-7" />
            </div>
          </div>

        </div>

        {/* Active Submissions & Interactions Grid (Matching Citizen Dashboard 2:1 column ratio) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: My Interacted & Reported Problems */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-purple-950 dark:text-white">My Interacted & Reported Problems</h3>
                <p className="text-xs text-purple-700/70 dark:text-purple-300/70">
                  Problems you accepted, rejected, or reported as guest
                </p>
              </div>
              <Link to="/guest" className="text-xs font-extrabold text-violet-600 dark:text-violet-400 hover:underline">
                View All Local Problems ({allIssues.length}) &rarr;
              </Link>
            </div>

            {displayFeed.length === 0 ? (
              <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-8 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-center space-y-3">
                <FileText className="w-8 h-8 text-purple-400 mx-auto" />
                <p className="text-sm text-purple-800 dark:text-purple-200 font-semibold">No guest interactions yet.</p>
                <Button onClick={() => setIsReportModalOpen(true)} size="sm">
                  Raise Your First Issue as Guest
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayFeed.map((issue) => {
                  const vote = guestVotes[issue.id];
                  const isAccepted = vote === 'ACCEPT';
                  const isRejected = vote === 'REJECT';

                  return (
                    <div
                      key={issue.id}
                      className="p-5 bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm hover:border-violet-300 dark:hover:border-violet-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={issue.status} size="sm" />
                          <PriorityIndicator score={issue.priorityScore} showScore={false} />
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/80 px-2 py-0.5 rounded-full border border-violet-200/50">
                            {issue.categoryName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            📍 {issue.distanceKm.toFixed(1)} km away
                          </span>
                        </div>

                        <Link to={`/issues/${issue.id}`} className="block">
                          <h4 className="text-sm font-extrabold text-purple-950 dark:text-purple-100 hover:text-violet-600 dark:hover:text-violet-400 truncate">
                            {issue.title}
                          </h4>
                        </Link>

                        <div className="flex items-center gap-1 text-xs text-purple-700/80 dark:text-purple-300/80">
                          <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                          <span className="truncate">{issue.address || 'Local Street Area'}</span>
                        </div>
                      </div>

                      {/* Green Accept & Red Reject Actions right on Dashboard Card */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => handleAccept(e, issue.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                            isAccepted
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                              : 'bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          }`}
                          title="Accept Issue"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept ({issue.acceptCount})</span>
                        </button>

                        <button
                          onClick={(e) => handleReject(e, issue.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                            isRejected
                              ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                              : 'bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-400 border-rose-500/30'
                          }`}
                          title="Reject Issue"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject ({issue.rejectCount})</span>
                        </button>

                        <Link to={`/issues/${issue.id}`}>
                          <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Col: Local Community Updates & Activity Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-purple-950 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>Local Activity Feed</span>
              </h3>
              <button
                onClick={openLocationPrompt}
                className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
              >
                Change Location
              </button>
            </div>

            <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-4">
              <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 text-xs space-y-1">
                <span className="font-extrabold text-indigo-950 dark:text-indigo-200 block">
                  Active Guest Location:
                </span>
                <p className="text-indigo-800/90 dark:text-indigo-300 font-bold truncate">
                  {userLocation?.cityName || 'Metro City Center'}
                </p>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                  {guestLat.toFixed(4)}, {guestLng.toFixed(4)}
                </p>
              </div>

              <div className="space-y-3">
                {augmentedIssues.slice(0, 3).map((issue) => (
                  <div
                    key={issue.id}
                    className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase text-violet-600 dark:text-violet-400">
                        {issue.categoryName}
                      </span>
                      <span className="text-[10px] text-purple-500 font-medium">
                        📍 {issue.distanceKm.toFixed(1)} km
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-purple-950 dark:text-purple-100 truncate">
                      {issue.title}
                    </h5>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-purple-700/80 dark:text-purple-300">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {issue.acceptCount} Accepted
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">
                        {issue.rejectCount} Rejected
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate('/guest')}
                variant="outline"
                className="w-full text-xs font-bold"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Browse Full Guest Feed
              </Button>
            </div>
          </div>

        </div>

      </div>

      {/* Guest Issue Creation Modal */}
      <GuestReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          reloadData();
          fetchIssues();
        }}
      />
    </AppShell>
  );
}
