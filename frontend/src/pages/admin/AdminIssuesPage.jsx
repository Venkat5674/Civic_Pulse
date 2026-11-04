import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Eye, Shield, CheckSquare, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { AdminLayout } from '../../components/layout/AdminLayout';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/issues/StatusBadge';
import { PriorityIndicator } from '../../components/issues/PriorityIndicator';
import { issueService } from '../../services/issueService';
import { useIssues } from '../../context/IssueContext';

export function AdminIssuesPage() {
  const { categories } = useIssues();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('priority');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await issueService.getIssues({
          search,
          category,
          status,
          sort,
          limit: 50,
        });
        setIssues(res.items || []);
      } catch (err) {
        toast.error('Failed to load issues');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [search, category, status, sort]);

  const hasActiveFilters = search || category !== 'all' || status !== 'all' || sort !== 'priority';

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setStatus('all');
    setSort('priority');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-midnight-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Municipal Issues Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
                {issues.length} Issues
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Search, prioritize, inspect, and update the status of civic reports across Metro City.
            </p>
          </div>
        </div>

        {/* Row-Aligned Executive Search & Filter Control Bar */}
        <div className="bg-white/90 dark:bg-midnight-850/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl backdrop-blur-xl transition-all">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
            
            {/* Search Input (Flex-1) */}
            <div className="w-full lg:flex-1 min-w-0">
              <Input
                placeholder="Search by title, reporter name, address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                containerClassName="w-full"
              />
            </div>

            {/* Filter Dropdowns (Aligned in single row on tablet/desktop) */}
            <div className="w-full lg:w-auto flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              
              {/* Category Select */}
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                containerClassName="w-full sm:w-48"
              >
                <option value="all">⚡ All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>

              {/* Status Select */}
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                containerClassName="w-full sm:w-40"
              >
                <option value="all">📌 All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="UNDER_REVIEW">UNDER REVIEW</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </Select>

              {/* Sort Select */}
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                containerClassName="w-full sm:w-44"
              >
                <option value="priority">🔥 Priority Score</option>
                <option value="newest">🕒 Newest First</option>
                <option value="confirmations">👍 Confirmations</option>
              </Select>

              {/* Clear / Reset Action Button */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 transition shrink-0"
                  title="Reset Filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-midnight-850/90 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl overflow-hidden backdrop-blur-xl transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50/90 dark:bg-midnight-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200/80 dark:border-midnight-700/80">
                <tr>
                  <th className="py-4 px-4">Priority</th>
                  <th className="py-4 px-4">Report Details</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Reporter</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-midnight-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 dark:text-slate-500 font-semibold">
                      Loading issues database...
                    </td>
                  </tr>
                ) : issues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 dark:text-slate-500">
                      No issues matching selected admin filters.
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50/80 dark:hover:bg-midnight-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <PriorityIndicator score={issue.priorityScore} />
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <Link to={`/admin/review/${issue.id}`} className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 truncate block transition">
                          {issue.title}
                        </Link>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">{issue.address}</span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-200">{issue.categoryName}</td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{issue.userName}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{issue.confirmationsCount} Confirmations</div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={issue.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link to={`/admin/review/${issue.id}`}>
                          <Button size="sm" variant="outline" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
