import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Shield, Clock, CheckCircle2 } from 'lucide-react';

import { AdminLayout } from '../../components/layout/AdminLayout';
import { adminService } from '../../services/adminService';

const COLORS = ['#4f46e5', '#d97706', '#7c3aed', '#059669', '#e11d48', '#0284c7'];

export function AdminAnalyticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await adminService.getDashboardStats();
      setStats(data);
    }
    load();
  }, []);

  const statusPieData = [
    { name: 'Open', value: stats?.openCount || 2 },
    { name: 'Under Review', value: stats?.underReviewCount || 1 },
    { name: 'In Progress', value: stats?.inProgressCount || 2 },
    { name: 'Resolved', value: stats?.resolvedCount || 1 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="pb-2 border-b border-slate-200/60 dark:border-midnight-800">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Platform Analytics & Intelligence</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Geospatial issue volume, category distributions, and resolution velocity metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Pie Chart */}
          <div className="bg-white dark:bg-midnight-850/90 p-6 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl space-y-4 backdrop-blur-xl transition-all">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Current Queue Status Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {statusPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Bar Chart */}
          <div className="bg-white dark:bg-midnight-850/90 p-6 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl space-y-4 backdrop-blur-xl transition-all">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Issues Count by Category</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.categoryDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
