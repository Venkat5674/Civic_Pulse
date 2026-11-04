import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Map,
  Grid,
  RotateCcw,
  X,
  Layers,
  Activity,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
  ChevronDown,
  Car,
  Lightbulb,
  Droplets,
  Trash2,
  Waves,
  Trees,
  Compass
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { IssueCard } from '../../components/issues/IssueCard';
import { IssueMap } from '../../components/maps/IssueMap';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { issueService } from '../../services/issueService';
import { useIssues } from '../../context/IssueContext';
import { useAuth } from '../../context/AuthContext';

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useIssues();
  const { userLocation } = useAuth();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [severity, setSeverity] = useState(searchParams.get('severity') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await issueService.getIssues({
          search,
          category,
          status,
          severity,
          sort,
          page,
          limit: 9,
        });
        setItems(res.items || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
      } catch (err) {
        console.warn('Load issues error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, category, status, severity, sort, page]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setSeverity('all');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = search || category !== 'all' || status !== 'all' || severity !== 'all' || sort !== 'newest';

  const categoryIcons = {
    'roads-potholes': Car,
    'street-lighting': Lightbulb,
    'water-leakage': Droplets,
    'waste-sanitation': Trash2,
    'drainage-sewage': Waves,
    'traffic-signals': AlertTriangle,
    'parks-recreation': Trees,
  };

  return (
    <AppShell>
      {/* 1. Page Header Banner */}
      <div className="relative bg-gradient-to-r from-[#f3e8ff] via-[#fbf5fd] to-[#f4ebfe] dark:from-[#090614] dark:via-[#0e0921] dark:to-[#080512] text-purple-950 dark:text-white py-10 lg:py-12 border-b border-purple-200/80 dark:border-purple-900/40 overflow-hidden transition-colors">
        <div className="absolute inset-0 opacity-15 dark:opacity-10 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-700 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Public Issue Registry</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-purple-950 dark:text-white">
                Explore Community Reports
              </h1>
              <p className="text-xs sm:text-sm text-purple-800/80 dark:text-purple-300/80 max-w-2xl leading-relaxed">
                Search, filter, and track public municipal infrastructure reports submitted by citizens across Metro City.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-white/80 dark:bg-[#150f2a]/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-purple-200/80 dark:border-purple-800/50 text-right shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                  Total Active Reports
                </span>
                <span className="text-xl font-black text-violet-700 dark:text-violet-300">{totalCount} Reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8">
        {/* Filter Control Box */}
        <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-md space-y-4 mb-8 transition-colors">
          {/* Row 1: Search Field + Reset Button + Mobile Filter Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, category, description, or street location..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-purple-200/80 dark:border-purple-800/50 bg-purple-50/50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 placeholder-purple-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-[#181130] transition"
              />
              {search ? (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden xl:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold bg-purple-100/80 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                  ⌘K
                </kbd>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-100/70 dark:bg-purple-900/40 hover:bg-purple-200 dark:hover:bg-purple-900/70 text-purple-900 dark:text-purple-200 text-xs font-bold border border-purple-200 dark:border-purple-800 md:hidden transition"
              >
                <SlidersHorizontal className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400" />
                )}
              </button>

              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-xs font-semibold text-purple-700 dark:text-purple-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>

          {/* Row 2: Category Quick Filters Bar (Horizontal Scrollable Pills) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
            <button
              onClick={() => {
                setCategory('all');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                category === 'all'
                  ? 'bg-purple-950 text-white dark:bg-violet-400 dark:text-purple-950 shadow-xs'
                  : 'bg-purple-100/70 text-purple-800 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/80 border border-purple-200/50 dark:border-purple-800/40'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Layers;
              const isActive = category === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-violet-600 text-white dark:bg-violet-500 dark:text-white shadow-xs border border-violet-500'
                      : 'bg-purple-100/70 text-purple-800 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/80 border border-purple-200/50 dark:border-purple-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Row 3: Dropdown Select Controls (Visible on MD+ or when Mobile Filters Open) */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-purple-100 dark:border-purple-900/30 ${mobileFiltersOpen ? 'block' : 'hidden md:grid'}`}>
            {/* Category Select */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Category</label>
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl bg-purple-50/60 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Status Select */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Status</label>
              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl bg-purple-50/60 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100"
              >
                <option value="all">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </Select>
            </div>

            {/* Severity Select */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Severity</label>
              <Select
                value={severity}
                onChange={(e) => {
                  setSeverity(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs font-semibold rounded-xl bg-purple-50/60 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100"
              >
                <option value="all">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>
            </div>

            {/* Sort Select */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Sort Order</label>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl bg-purple-50/60 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-100"
              >
                <option value="newest">Newest First</option>
                <option value="priority">Priority Score</option>
                <option value="confirmations">Most Confirmed</option>
              </Select>
            </div>
          </div>

          {/* Row 4: Results Counter & Segmented View Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-purple-100 dark:border-purple-900/30 gap-3 text-xs text-purple-700/80 dark:text-purple-300">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-purple-950 dark:text-white font-bold">{items.length}</strong> of{' '}
                <strong className="text-purple-950 dark:text-white font-bold">{totalCount}</strong> reports
              </span>
            </div>

            {/* Grid / Map View Switcher */}
            <div className="flex items-center bg-purple-100/70 dark:bg-purple-950/60 p-1 rounded-xl border border-purple-200 dark:border-purple-800 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-violet-700 shadow-2xs dark:bg-violet-600 dark:text-white'
                    : 'text-purple-800 dark:text-purple-300 hover:text-purple-950 dark:hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-violet-700 shadow-2xs dark:bg-violet-600 dark:text-white'
                    : 'text-purple-800 dark:text-purple-300 hover:text-purple-950 dark:hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Split Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Content Body & Grid Output */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No civic reports match your filters"
            description="Try resetting your category, status, or search keywords to view public issues."
            actionLabel="Reset All Filters"
            onAction={handleClearFilters}
          />
        ) : viewMode === 'map' ? (
          /* Split Map View Layout (1440px Desktop 12-col grid) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-4 max-h-[750px] overflow-y-auto pr-2 scrollbar-thin">
              {items.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
            <div className="lg:col-span-6 sticky top-24">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                <IssueMap
                  issues={items}
                  center={[userLocation?.lat || 37.774929, userLocation?.lng || -122.419416]}
                  height="720px"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Responsive Card Grid View (1440px 3-column grid) */
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
              {items.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200/80">
                <Button
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 border-slate-300 font-semibold"
                >
                  Previous
                </Button>
                <span className="text-xs font-bold text-slate-700 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 border-slate-300 font-semibold"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

