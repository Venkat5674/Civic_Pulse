import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Sparkles,
  Search,
  Filter,
  Navigation,
  Compass,
  Check,
  X,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Layers,
  Map,
  Grid,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/issues/StatusBadge';
import { PriorityIndicator } from '../../components/issues/PriorityIndicator';
import { GuestReportIssueModal } from '../../components/modals/GuestReportIssueModal';
import { IssueMap } from '../../components/maps/IssueMap';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';
import { issueService } from '../../services/issueService';
import { calculateDistanceKm } from '../../services/duplicateDetectionService';

export function GuestPage() {
  const { userLocation, openLocationPrompt } = useAuth();
  const { categories, reloadData } = useIssues();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRadius, setSelectedRadius] = useState('ALL'); // '1', '3', '5', '10', 'ALL'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Persistent Guest votes state: { [issueId]: 'ACCEPT' | 'REJECT' }
  const [guestVotes, setGuestVotes] = useState(() => {
    try {
      const saved = localStorage.getItem('civicpulse_guest_votes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Local state offset counts for live feedback: { [issueId]: { accepts: number, rejects: number } }
  const [voteOffsets, setVoteOffsets] = useState({});

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await issueService.getIssues({ limit: 100 });
        setIssues(res.items || []);
      } catch (err) {
        console.warn('Error loading issues for Guest page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save guest votes to localStorage
  const saveVote = (issueId, voteType) => {
    const updated = { ...guestVotes, [issueId]: voteType };
    setGuestVotes(updated);
    localStorage.setItem('civicpulse_guest_votes', JSON.stringify(updated));
  };

  // Handle Accept Button Click (GREEN)
  const handleAccept = (e, issue) => {
    e.preventDefault();
    e.stopPropagation();

    const currentVote = guestVotes[issue.id];
    const prevOffset = voteOffsets[issue.id] || { accepts: 0, rejects: 0 };

    if (currentVote === 'ACCEPT') {
      // Toggle off
      const { [issue.id]: removed, ...rest } = guestVotes;
      setGuestVotes(rest);
      localStorage.setItem('civicpulse_guest_votes', JSON.stringify(rest));
      setVoteOffsets((prev) => ({
        ...prev,
        [issue.id]: { ...prevOffset, accepts: prevOffset.accepts - 1 },
      }));
      toast.info('Removed your acceptance for this issue.');
    } else {
      // Vote ACCEPT
      saveVote(issue.id, 'ACCEPT');
      const rejectAdjustment = currentVote === 'REJECT' ? -1 : 0;
      setVoteOffsets((prev) => ({
        ...prev,
        [issue.id]: {
          accepts: prevOffset.accepts + 1,
          rejects: prevOffset.rejects + rejectAdjustment,
        },
      }));
      toast.success('Accepted! You endorsed this issue solution in your area.', {
        icon: '✅',
      });
    }
  };

  // Handle Reject Button Click (RED)
  const handleReject = (e, issue) => {
    e.preventDefault();
    e.stopPropagation();

    const currentVote = guestVotes[issue.id];
    const prevOffset = voteOffsets[issue.id] || { accepts: 0, rejects: 0 };

    if (currentVote === 'REJECT') {
      // Toggle off
      const { [issue.id]: removed, ...rest } = guestVotes;
      setGuestVotes(rest);
      localStorage.setItem('civicpulse_guest_votes', JSON.stringify(rest));
      setVoteOffsets((prev) => ({
        ...prev,
        [issue.id]: { ...prevOffset, rejects: prevOffset.rejects - 1 },
      }));
      toast.info('Removed your rejection for this issue.');
    } else {
      // Vote REJECT
      saveVote(issue.id, 'REJECT');
      const acceptAdjustment = currentVote === 'ACCEPT' ? -1 : 0;
      setVoteOffsets((prev) => ({
        ...prev,
        [issue.id]: {
          accepts: prevOffset.accepts + acceptAdjustment,
          rejects: prevOffset.rejects + 1,
        },
      }));
      toast.error('Rejected! You flagged this issue as inaccurate or not needed.', {
        icon: '❌',
      });
    }
  };

  // Calculate distance & augment issues
  const guestLat = userLocation?.lat || 37.774929;
  const guestLng = userLocation?.lng || -122.419416;

  const augmentedIssues = issues.map((item) => {
    const dist = calculateDistanceKm(guestLat, guestLng, item.latitude, item.longitude);
    const offset = voteOffsets[item.id] || { accepts: 0, rejects: 0 };
    const baseConfirmations = item.confirmationsCount || 0;
    // Estimate initial reject count for mock demo if not present
    const baseRejects = Math.floor(baseConfirmations * 0.2);

    return {
      ...item,
      distanceKm: dist,
      acceptCount: Math.max(0, baseConfirmations + offset.accepts),
      rejectCount: Math.max(0, baseRejects + offset.rejects),
    };
  });

  // Filter based on radius, search, category
  const filteredIssues = augmentedIssues.filter((item) => {
    // Radius filter
    if (selectedRadius !== 'ALL') {
      const radiusKm = parseFloat(selectedRadius);
      if (item.distanceKm > radiusKm) return false;
    }
    // Category filter
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
      return false;
    }
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchAddr = item.address?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAddr) return false;
    }
    return true;
  });

  // Sort by nearest distance first
  filteredIssues.sort((a, b) => a.distanceKm - b.distanceKm);

  return (
    <AppShell>
      {/* 1. Guest Hero / Location Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-[#0c081e] text-white py-12 px-4 sm:px-6 lg:px-10 border-b border-indigo-900/50 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="relative max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Guest Community Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
              Nearby Civic Issues <br />
              <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Based on Your Location
              </span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              Browse infrastructure reports near your position. Accept or reject reports to shape city priorities, or raise a new issue instantly!
            </p>
          </div>

          {/* Active Guest Location Card & CTA */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Location Selector Card */}
            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 text-left space-y-1.5 shadow-lg">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-brand-400 animate-bounce" /> Your Location:
                </span>
                <button
                  onClick={openLocationPrompt}
                  className="font-bold text-brand-400 hover:text-brand-300 underline text-xs transition"
                >
                  Change
                </button>
              </div>
              <p className="text-sm font-bold text-white truncate max-w-[240px]">
                {userLocation?.cityName || 'Metro City Center'}
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                {guestLat.toFixed(4)}, {guestLng.toFixed(4)}
              </p>
            </div>

            {/* Raise an Issue Button */}
            <Button
              onClick={() => setIsReportModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-brand-600 via-violet-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold shadow-xl shadow-brand-500/25 rounded-2xl px-6 py-4 flex items-center justify-center gap-2 group transition-all duration-200"
            >
              <PlusCircle className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span>Raise an Issue</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
        
        {/* Controls Header: Search + Radius Filter + Category Filter + View Switcher */}
        <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-md space-y-4 mb-8">
          
          {/* Row 1: Search Input & Location Radius Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search local problems by title, description, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-purple-200/80 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 placeholder-purple-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-[#181130] transition"
              />
            </div>

            {/* Radius Selector Pills */}
            <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-violet-500" /> Radius:
              </span>
              {[
                { id: '1', label: 'Within 1 km' },
                { id: '3', label: 'Within 3 km' },
                { id: '5', label: 'Within 5 km' },
                { id: '10', label: 'Within 10 km' },
                { id: 'ALL', label: 'All Locations' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRadius(r.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedRadius === r.id
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-purple-100/70 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/80 border border-purple-200/50 dark:border-purple-800/40'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

          </div>

          {/* Row 2: Category Filter Pills & View Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/30">
            {/* Category Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-purple-950 text-white dark:bg-violet-400 dark:text-purple-950'
                    : 'bg-purple-100/70 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-purple-100/70 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-purple-100/70 dark:bg-purple-950/60 p-1 rounded-xl border border-purple-200 dark:border-purple-800 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-violet-700 shadow-2xs dark:bg-violet-600 dark:text-white'
                    : 'text-purple-800 dark:text-purple-300'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-violet-700 shadow-2xs dark:bg-violet-600 dark:text-white'
                    : 'text-purple-800 dark:text-purple-300'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Split Map</span>
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-xs text-purple-700 dark:text-purple-300 pt-1 font-medium flex items-center justify-between">
            <span>
              Found <strong className="text-purple-950 dark:text-white font-bold">{filteredIssues.length}</strong> local problem(s) near{' '}
              <strong className="text-violet-700 dark:text-violet-300 font-bold">{userLocation?.cityName || 'your location'}</strong>
            </span>
            <span className="text-[11px] text-purple-500 font-normal hidden sm:inline">
              Sorted by proximity to your current coordinates
            </span>
          </div>
        </div>

        {/* 3. Problem Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredIssues.length === 0 ? (
          <EmptyState
            title="No problems found in this location radius"
            description="Try expanding your distance radius filter or raise a new issue for your neighborhood."
            actionLabel="Raise a New Issue"
            onAction={() => setIsReportModalOpen(true)}
          />
        ) : viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4 max-h-[750px] overflow-y-auto pr-2 scrollbar-thin">
              {filteredIssues.map((issue) => (
                <GuestProblemCard
                  key={issue.id}
                  issue={issue}
                  guestVote={guestVotes[issue.id]}
                  onAccept={(e) => handleAccept(e, issue)}
                  onReject={(e) => handleReject(e, issue)}
                />
              ))}
            </div>
            <div className="lg:col-span-6 sticky top-24">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                <IssueMap issues={filteredIssues} center={[guestLat, guestLng]} height="720px" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {filteredIssues.map((issue) => (
              <GuestProblemCard
                key={issue.id}
                issue={issue}
                guestVote={guestVotes[issue.id]}
                onAccept={(e) => handleAccept(e, issue)}
                onReject={(e) => handleReject(e, issue)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. Guest Report Issue Modal */}
      <GuestReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={() => {
          reloadData();
          async function refresh() {
            const res = await issueService.getIssues({ limit: 100 });
            setIssues(res.items || []);
          }
          refresh();
        }}
      />
    </AppShell>
  );
}

{/* Individual Guest Problem Card Component with GREEN Accept & RED Reject buttons */}
function GuestProblemCard({ issue, guestVote, onAccept, onReject }) {
  const primaryImage = issue.images && issue.images.length > 0 ? issue.images[0].imageUrl : null;
  const isAccepted = guestVote === 'ACCEPT';
  const isRejected = guestVote === 'REJECT';

  return (
    <div className="group bg-white/95 dark:bg-[#120d24]/95 backdrop-blur-md rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Image & Distance Badge */}
        {primaryImage ? (
          <div className="relative h-48 w-full bg-purple-50 dark:bg-purple-950/40 overflow-hidden">
            <img
              src={primaryImage}
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <StatusBadge status={issue.status} />
            </div>

            {/* Distance Pill */}
            <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 shadow-md">
              <MapPin className="w-3 h-3 text-brand-400" />
              <span>{issue.distanceKm.toFixed(1)} km away</span>
            </div>
          </div>
        ) : (
          <div className="p-5 pb-0 flex items-center justify-between">
            <StatusBadge status={issue.status} />
            <div className="bg-purple-100/80 dark:bg-purple-900/50 text-purple-900 dark:text-purple-200 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              <span>{issue.distanceKm.toFixed(1)} km away</span>
            </div>
          </div>
        )}

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700 dark:text-violet-300 bg-violet-100/80 dark:bg-violet-950/80 px-2.5 py-0.5 rounded-full border border-violet-200/50 dark:border-violet-800/50">
              {issue.categoryName}
            </span>
            <PriorityIndicator score={issue.priorityScore} />
          </div>

          <Link to={`/issues/${issue.id}`} className="block">
            <h3 className="text-base font-bold text-purple-950 dark:text-purple-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition line-clamp-2">
              {issue.title}
            </h3>
          </Link>

          <p className="text-xs text-purple-800/75 dark:text-purple-300/75 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-purple-700/80 dark:text-purple-300/70 pt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-violet-500" />
            <span className="truncate">{issue.address || 'Local Street Area'}</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer: GREEN Accept & RED Reject Buttons */}
      <div className="p-4 bg-purple-50/50 dark:bg-purple-950/30 border-t border-purple-100 dark:border-purple-900/30 space-y-2">
        <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>Community Consensus</span>
          <span className="text-purple-400">Guest Feedback</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* GREEN ACCEPT BUTTON */}
          <button
            onClick={onAccept}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 border shadow-xs ${
              isAccepted
                ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-400 shadow-md scale-[1.02]'
                : 'bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
            }`}
            title="Accept / Endorse this problem report"
          >
            <CheckCircle2 className={`w-4 h-4 ${isAccepted ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <span>Accept</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-950/20 text-[10px]">
              {issue.acceptCount}
            </span>
          </button>

          {/* RED REJECT BUTTON */}
          <button
            onClick={onReject}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 border shadow-xs ${
              isRejected
                ? 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-400 shadow-md scale-[1.02]'
                : 'bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-400 border-rose-500/30'
            }`}
            title="Reject / Disagree with this problem report"
          >
            <XCircle className={`w-4 h-4 ${isRejected ? 'text-white' : 'text-rose-600 dark:text-rose-400'}`} />
            <span>Reject</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-950/20 text-[10px]">
              {issue.rejectCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
