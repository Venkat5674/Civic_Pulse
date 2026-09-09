import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Eye, Shield, CheckSquare } from 'lucide-react';
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Municipal Issues Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, prioritize, inspect, and update the status of civic reports across Metro City.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search title, reporter name, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-40">
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
              <option value="all">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="REJECTED">REJECTED</option>
            </Select>

            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-36">
              <option value="priority">Priority Score</option>
              <option value="newest">Newest First</option>
              <option value="confirmations">Confirmations</option>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Report Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No issues matching selected admin filters.
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <PriorityIndicator score={issue.priorityScore} />
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <Link to={`/admin/review/${issue.id}`} className="font-bold text-slate-900 hover:text-brand-600 truncate block">
                          {issue.title}
                        </Link>
                        <span className="text-[11px] text-slate-500 truncate block">{issue.address}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{issue.categoryName}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{issue.userName}</div>
                        <div className="text-[10px] text-slate-400">{issue.confirmationsCount} Confirmations</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={issue.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
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
