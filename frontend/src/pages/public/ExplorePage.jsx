import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Map, Grid, RotateCcw } from 'lucide-react';
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

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useIssues();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [severity, setSeverity] = useState(searchParams.get('severity') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

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

  return (
    <AppShell>
      <div className="bg-slate-900 text-white py-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Explore Community Reports</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Search, filter, and track public civic issues across Metro City.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search title, description, or street location..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-40"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>

              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-36"
              >
                <option value="all">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </Select>

              <Select
                value={severity}
                onChange={(e) => {
                  setSeverity(e.target.value);
                  setPage(1);
                }}
                className="w-36"
              >
                <option value="all">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </Select>

              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-36"
              >
                <option value="newest">Newest First</option>
                <option value="priority">Priority Score</option>
                <option value="confirmations">Most Confirmed</option>
              </Select>

              <Button
                onClick={handleClearFilters}
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-900">{items.length}</strong> of{' '}
              <strong className="text-slate-900">{totalCount}</strong> reports
            </span>

            {/* Grid / Map toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-brand-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition ${
                  viewMode === 'map'
                    ? 'bg-white text-brand-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Split Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No reports match your filters"
            description="Try adjusting your category, status, or search keywords to find issues."
            actionLabel="Reset All Filters"
            onAction={handleClearFilters}
          />
        ) : viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {items.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
            <div className="sticky top-20">
              <IssueMap issues={items} height="600px" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-xs font-semibold text-slate-700 px-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
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
