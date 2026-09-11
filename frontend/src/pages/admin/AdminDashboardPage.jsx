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
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-violet-950 text-white p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-purple-800/40">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Municipal Operations Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              City Administration Overview
            </h1>
            <p className="text-xs text-purple-200/80 max-w-xl">
              Monitor active repair queues, dispatch maintenance crews, and analyze urban resolution metrics.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin/issues')} variant="primary" className="bg-violet-600 hover:bg-violet-500">
              Manage Issues Queue
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-2 transition-colors">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
              <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="block text-3xl font-extrabold text-purple-950 dark:text-white">{stats?.totalIssues || 0}</span>
            <span className="text-xs text-purple-700/70 dark:text-purple-300/70 font-medium">Logged across Metro City</span>
          </div>

          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-2 transition-colors">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="text-xs font-bold uppercase tracking-wider">Open Queue</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <span className="block text-3xl font-extrabold text-amber-600 dark:text-amber-400">{stats?.openCount || 0}</span>
            <span className="text-xs text-purple-700/70 dark:text-purple-300/70 font-medium">Awaiting review / dispatch</span>
          </div>

          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-2 transition-colors">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="block text-3xl font-extrabold text-purple-600 dark:text-purple-300">{stats?.inProgressCount || 0}</span>
            <span className="text-xs text-purple-700/70 dark:text-purple-300/70 font-medium">Assigned to field crews</span>
          </div>

          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-2 transition-colors">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="text-xs font-bold uppercase tracking-wider">Resolved Rate</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="block text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats?.totalIssues ? Math.round((stats.resolvedCount / stats.totalIssues) * 100) : 0}%
            </span>
            <span className="text-xs text-purple-700/70 dark:text-purple-300/70 font-medium">Completed resolution rate</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Area Chart */}
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-4 transition-colors">
            <h3 className="text-base font-bold text-purple-950 dark:text-white">Monthly Issue Resolution Trends</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.trendData || []}>
                  <defs>
                    <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#a78bfa" strokeOpacity={0.2} />
                  <XAxis dataKey="month" stroke="#a78bfa" fontSize={12} />
                  <YAxis stroke="#a78bfa" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Open" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorOpen)" />
                  <Area type="monotone" dataKey="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Bar Chart */}
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-4 transition-colors">
            <h3 className="text-base font-bold text-purple-950 dark:text-white">Report Breakdown by Category</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.categoryDistribution || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#a78bfa" strokeOpacity={0.2} />
                  <XAxis type="number" stroke="#a78bfa" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#c084fc" fontSize={11} width={130} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Priority Dispatch Queue Table */}
        <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card p-6 space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="text-base font-bold text-purple-950 dark:text-white">High-Priority Dispatch Queue</h3>
            </div>
            <Link to="/admin/issues" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
              View All Queue Items &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-950 dark:text-purple-100">
              <thead className="bg-purple-50/70 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 uppercase font-bold border-b border-purple-100 dark:border-purple-900/40">
                <tr>
                  <th className="py-3 px-4">Priority Score</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Title & Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100/60 dark:divide-purple-900/30 font-medium">
                {(stats?.priorityQueue || []).slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40 transition">
                    <td className="py-3 px-4">
                      <PriorityIndicator score={item.priorityScore} />
                    </td>
                    <td className="py-3 px-4 font-semibold text-purple-950 dark:text-purple-100">{item.categoryName}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-purple-950 dark:text-white truncate">{item.title}</div>
                      <div className="text-[11px] text-purple-700/70 dark:text-purple-300/70 truncate">{item.address}</div>
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
