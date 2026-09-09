import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  Shield,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Layers,
} from 'lucide-react';

import { AdminLayout } from '../../components/layout/AdminLayout';
import { StatusBadge } from '../../components/issues/StatusBadge';
import { PriorityIndicator } from '../../components/issues/PriorityIndicator';
import { Button } from '../../components/ui/Button';

import { adminService } from '../../services/adminService';
import { mockDB } from '../../services/api';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.warn('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const auditLogs = mockDB.getAuditLogs().slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Municipal Operations Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              City Administration Overview
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Monitor active repair queues, dispatch maintenance crews, and analyze urban resolution metrics.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin/issues')} variant="primary" className="bg-brand-600">
              Manage Issues Queue
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
              <FileText className="w-5 h-5 text-brand-600" />
            </div>
            <span className="block text-3xl font-extrabold text-slate-900">{stats?.totalIssues || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Logged across Metro City</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Open Queue</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <span className="block text-3xl font-extrabold text-amber-600">{stats?.openCount || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Awaiting review / dispatch</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="block text-3xl font-extrabold text-purple-600">{stats?.inProgressCount || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Assigned to field crews</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Resolved Rate</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="block text-3xl font-extrabold text-emerald-600">
              {stats?.totalIssues ? Math.round((stats.resolvedCount / stats.totalIssues) * 100) : 0}%
            </span>
            <span className="text-xs text-slate-500 font-medium">Completed resolution rate</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Area Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900">Monthly Issue Resolution Trends</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.trendData || []}>
                  <defs>
                    <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Open" stroke="#6366f1" fillOpacity={1} fill="url(#colorOpen)" />
                  <Area type="monotone" dataKey="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900">Report Breakdown by Category</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.categoryDistribution || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={130} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Priority Dispatch Queue Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">High-Priority Dispatch Queue</h3>
            </div>
            <Link to="/admin/issues" className="text-xs font-bold text-brand-600 hover:underline">
              View All Queue Items &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Priority Score</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Title & Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(stats?.priorityQueue || []).slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <PriorityIndicator score={item.priorityScore} />
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.categoryName}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">{item.address}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/admin/review/${item.id}`}>
                        <Button size="sm" variant="outline">
                          Review Report
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
