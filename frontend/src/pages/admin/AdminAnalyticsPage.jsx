import React, { useState, useEffect, useRef } from 'react';
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
import {
  BarChart3,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  Download,
  Printer,
  FileText,
  Filter,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  ChevronDown,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/issues/StatusBadge';
import { SeverityBadge } from '../../components/issues/SeverityBadge';
import { adminService } from '../../services/adminService';
import { issueService } from '../../services/issueService';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#4f46e5', '#d97706', '#7c3aed', '#059669', '#e11d48', '#0284c7', '#64748b'];

export function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Export filters & state
  const [exportStatus, setExportStatus] = useState('all');
  const [exportCategory, setExportCategory] = useState('all');
  const [exportingCSV, setExportingCSV] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsData, analyticsData, catData, issueData] = await Promise.all([
          adminService.getDashboardStats().catch(() => null),
          adminService.getAdminAnalytics().catch(() => null),
          adminService.getCategories().catch(() => []),
          issueService.getIssues({ limit: 100 }).catch(() => ({ items: [] })),
        ]);

        setStats(statsData);
        setAnalytics(analyticsData);
        setCategories(catData || []);
        setIssues(issueData?.items || []);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtered issues for export / report
  const filteredIssues = issues.filter((i) => {
    const matchStatus = exportStatus === 'all' || i.status === exportStatus;
    const matchCategory =
      exportCategory === 'all' ||
      i.categoryId === exportCategory ||
      i.categoryName?.toLowerCase() === exportCategory.toLowerCase();
    return matchStatus && matchCategory;
  });

  const totalReported = stats?.totalIssues || issues.length || 0;
  const resolvedCount = stats?.resolvedCount || issues.filter((i) => i.status === 'RESOLVED').length;
  const activeCount =
    (stats?.openCount || 0) +
    (stats?.underReviewCount || 0) +
    (stats?.inProgressCount || 0);
  const resolutionRate =
    totalReported > 0 ? Math.round((resolvedCount / totalReported) * 100) : 100;

  const statusPieData = [
    { name: 'Open', value: stats?.openCount || issues.filter((i) => i.status === 'OPEN').length || 1 },
    { name: 'Under Review', value: stats?.underReviewCount || issues.filter((i) => i.status === 'UNDER_REVIEW').length || 0 },
    { name: 'In Progress', value: stats?.inProgressCount || issues.filter((i) => i.status === 'IN_PROGRESS').length || 1 },
    { name: 'Resolved', value: resolvedCount || 0 },
    { name: 'Withdrawn', value: issues.filter((i) => i.status === 'CANCELLED').length || 0 },
    { name: 'Rejected', value: stats?.rejectedCount || issues.filter((i) => i.status === 'REJECTED').length || 0 },
  ].filter((item) => item.value > 0);

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      const blob = await adminService.exportIssuesCSV({
        status: exportStatus,
        categoryId: exportCategory,
      });

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `municipal-issues-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Municipal CSV Report downloaded successfully');
    } catch (err) {
      console.error('CSV export failed:', err);
      toast.error('Failed to export CSV report');
    } finally {
      setExportingCSV(false);
    }
  };

  const handlePrintPDF = () => {
    const printContent = document.getElementById('printable-municipal-report');
    if (!printContent) return;

    try {
      const printWin = window.open('', '_blank', 'width=1050,height=900');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>CivicPulse Municipal Infrastructure Report - ${reportRef}</title>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap">
              <style>
                @page {
                  size: A4 portrait;
                  margin: 14mm 12mm 14mm 12mm;
                }
                * {
                  box-sizing: border-box;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  color: #0f172a;
                  background: #ffffff;
                  margin: 0;
                  padding: 8px;
                  font-size: 12px;
                  line-height: 1.45;
                }
                .border-b-2 { border-bottom: 2px solid #0f172a !important; }
                .border-b { border-bottom: 1px solid #e2e8f0 !important; }
                .border-t { border-top: 1px solid #cbd5e1 !important; }
                .border { border: 1px solid #cbd5e1 !important; }
                .rounded-xl { border-radius: 10px; }
                .rounded-lg { border-radius: 6px; }
                .rounded-full { border-radius: 9999px; }
                .bg-slate-50 { background-color: #f8fafc !important; }
                .bg-slate-100 { background-color: #f1f5f9 !important; }
                .bg-violet-700 { background-color: #6d28d9 !important; }
                .text-white { color: #ffffff !important; }
                .text-slate-950 { color: #020617 !important; }
                .text-slate-900 { color: #0f172a !important; }
                .text-slate-700 { color: #334155 !important; }
                .text-slate-600 { color: #475569 !important; }
                .text-slate-500 { color: #64748b !important; }
                .text-emerald-700 { color: #047857 !important; }
                .text-indigo-700 { color: #4338ca !important; }
                .text-violet-700 { color: #6d28d9 !important; }
                .font-black { font-weight: 900; }
                .font-extrabold { font-weight: 800; }
                .font-bold { font-weight: 700; }
                .font-semibold { font-weight: 600; }
                .font-medium { font-weight: 500; }
                .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
                .uppercase { text-transform: uppercase; }
                .tracking-wider { letter-spacing: 0.05em; }
                .tracking-tight { letter-spacing: -0.025em; }
                .p-8 { padding: 24px; }
                .p-3 { padding: 12px; }
                .pb-5 { padding-bottom: 18px; }
                .pt-8 { padding-top: 24px; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                .py-2\.5 { padding-top: 9px; padding-bottom: 9px; }
                .px-3 { padding-left: 12px; padding-right: 12px; }
                .gap-3 { gap: 12px; }
                .gap-4 { gap: 16px; }
                .gap-8 { gap: 32px; }
                .space-y-6 > * + * { margin-top: 22px; }
                .space-y-0\.5 > * + * { margin-top: 2px; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
                .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .items-start { align-items: flex-start; }
                .justify-between { justify-content: space-between; }
                .justify-center { justify-content: center; }
                .shrink-0 { flex-shrink: 0; }
                .w-12 { width: 44px; }
                .h-12 { height: 44px; }
                .w-48 { width: 180px; }
                .text-2xl { font-size: 22px; }
                .text-xl { font-size: 20px; }
                .text-lg { font-size: 17px; }
                .text-sm { font-size: 13px; }
                .text-xs { font-size: 11px; }
                .text-\[11px\] { font-size: 11px; }
                .text-\[10px\] { font-size: 10px; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .block { display: block; }
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-6 { margin-bottom: 24px; }
                .mt-0\.5 { margin-top: 2px; }
                .mt-1 { margin-top: 4px; }
                .ml-auto { margin-left: auto; }
                .whitespace-nowrap { white-space: nowrap; }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  border: 1px solid #cbd5e1;
                }
                th {
                  background-color: #f1f5f9 !important;
                  color: #1e293b !important;
                  font-weight: 700;
                  text-transform: uppercase;
                  font-size: 9.5px;
                  letter-spacing: 0.05em;
                  padding: 8px 10px;
                  border: 1px solid #cbd5e1;
                  text-align: left;
                }
                td {
                  padding: 8px 10px;
                  border: 1px solid #e2e8f0;
                  vertical-align: top;
                  font-size: 11px;
                }
                tr:nth-child(even) td {
                  background-color: #f8fafc !important;
                }
                .no-print { display: none !important; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          printWin.print();
          printWin.close();
        }, 350);
        return;
      }
    } catch (err) {
      console.warn('Dedicated print window failed, using direct print fallback:', err);
    }

    // Direct window.print() fallback with overflow restoration
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'visible';
    window.print();
    setTimeout(() => {
      document.body.style.overflow = prevOverflow;
    }, 1000);
  };

  const reportDate = format(new Date(), 'MMMM d, yyyy');
  const reportRef = `MUN-REP-${Date.now().toString(36).toUpperCase()}`;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with quick export controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-200/80 dark:border-purple-900/40">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-purple-950 dark:text-white tracking-tight">
              Platform Analytics & Municipal Reports
            </h1>
            <p className="text-xs sm:text-sm text-purple-700/80 dark:text-purple-300/80 mt-1">
              Geospatial issue distribution, resolution velocity, and municipal compliance exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleExportCSV}
              isLoading={exportingCSV}
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
            >
              Export CSV
            </Button>
            <Button
              onClick={() => setPdfModalOpen(true)}
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print / Export PDF Report
            </Button>
          </div>
        </div>

        {/* Executive KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Reports</span>
              <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-3xl font-extrabold text-purple-950 dark:text-white">
              {totalReported}
            </div>
            <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70">Cumulative citizen filings</p>
          </div>

          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-bold uppercase tracking-wider">Resolution Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {resolutionRate}%
            </div>
            <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70">{resolvedCount} resolved issues</p>
          </div>

          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-xs font-bold uppercase tracking-wider">Active Workload</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {activeCount}
            </div>
            <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70">In review or active dispatch</p>
          </div>

          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-5 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-violet-600 dark:text-violet-400">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Resolution</span>
              <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="text-3xl font-extrabold text-purple-950 dark:text-white">
              {stats?.avgResolutionHours || 24}h
            </div>
            <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70">Mean dispatch time to repair</p>
          </div>
        </div>

        {/* Municipal Export & Filter Console Card */}
        <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-purple-950 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span>Municipal Report Generator & Data Export</span>
              </h2>
              <p className="text-xs text-purple-800/70 dark:text-purple-300/70 mt-0.5">
                Filter and export comprehensive departmental records for civic audits, state reporting, or municipal meetings.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300">
              <span>Matching Records:</span>
              <span className="bg-violet-100 dark:bg-violet-950 px-2 py-0.5 rounded-full text-violet-800 dark:text-violet-200 border border-violet-200 dark:border-violet-800">
                {filteredIssues.length} issues
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-purple-900 dark:text-purple-200 mb-1">
                Filter by Status
              </label>
              <Select
                value={exportStatus}
                onChange={(e) => setExportStatus(e.target.value)}
                className="w-full"
              >
                <option value="all">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CANCELLED">Withdrawn</option>
                <option value="REJECTED">Rejected</option>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-900 dark:text-purple-200 mb-1">
                Filter by Category
              </label>
              <Select
                value={exportCategory}
                onChange={(e) => setExportCategory(e.target.value)}
                className="w-full"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleExportCSV}
                isLoading={exportingCSV}
                variant="outline"
                className="w-full"
                leftIcon={<Download className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
              >
                Export CSV ({filteredIssues.length})
              </Button>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setPdfModalOpen(true)}
                variant="primary"
                className="w-full"
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Generate Report PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Pie Chart */}
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-4">
            <h3 className="text-base font-bold text-purple-950 dark:text-white">
              Queue Status Distribution
            </h3>
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
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-4">
            <h3 className="text-base font-bold text-purple-950 dark:text-white">
              Issues Volume by Category
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.categoryDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8b5cf633" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Print Styles for Native PDF Generation Fallback */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 12mm 10mm;
              }

              html, body {
                overflow: visible !important;
                height: auto !important;
                min-height: 100% !important;
                background: #ffffff !important;
                color: #0f172a !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              /* Hide navbars, sidebars, headers */
              nav, header, aside, .no-print {
                display: none !important;
              }

              /* Unconstrain Modal Fixed Center Wrapper */
              .fixed.inset-0 {
                position: static !important;
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
                overflow: visible !important;
                height: auto !important;
                max-height: none !important;
              }

              /* Hide Modal Backdrop and Title bar */
              .fixed.inset-0.bg-slate-900\\/60,
              div[role="dialog"] > div:first-child {
                display: none !important;
              }

              /* Flatten Dialog Card to 100% width document */
              div[role="dialog"] {
                position: static !important;
                width: 100% !important;
                max-width: 100% !important;
                background: #ffffff !important;
                color: #0f172a !important;
                border: none !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                overflow: visible !important;
                padding: 0 !important;
                margin: 0 !important;
                transform: none !important;
              }

              /* Ensure modal inner scroll area doesn't clip */
              .max-h-\\[80vh\\] {
                max-height: none !important;
                overflow: visible !important;
              }

              #printable-municipal-report {
                display: block !important;
                position: static !important;
                width: 100% !important;
                background: #ffffff !important;
                color: #0f172a !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }

              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `
        }} />

        {/* Official PDF / Printable Municipal Report Modal */}
        <Modal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          title="Official Municipal Report Preview"
          maxWidth="max-w-5xl"
        >
          <div className="space-y-6 pt-2 max-h-[80vh] overflow-y-auto pr-1">
            {/* Action Bar inside Modal */}
            <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200 dark:border-purple-800 no-print">
              <div>
                <p className="text-xs font-bold text-purple-950 dark:text-purple-100">
                  Ready to print or save as PDF
                </p>
                <p className="text-[11px] text-purple-700/70 dark:text-purple-300/70">
                  Click Print and select "Save as PDF" in your browser's print dialog.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Export CSV
                </Button>
                <Button
                  onClick={handlePrintPDF}
                  variant="primary"
                  size="sm"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print / Save PDF
                </Button>
              </div>
            </div>

            {/* Printable Docket Content */}
            <div
              id="printable-municipal-report"
              className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 text-sm"
            >
              {/* Report Official Header */}
              <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-700 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                    CP
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                      CivicPulse Municipal Administration
                    </h2>
                    <p className="text-xs font-semibold text-slate-600">
                      Department of Public Works & Urban Infrastructure
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      REF ID: {reportRef} • CLASSIFICATION: OFFICIAL USE
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-600 space-y-0.5">
                  <p><span className="font-bold">Generated:</span> {reportDate}</p>
                  <p><span className="font-bold">Auditor:</span> {user?.name || 'City Official'}</p>
                  <p><span className="font-bold">Role:</span> Municipal Administrator</p>
                </div>
              </div>

              {/* Report Parameters */}
              <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Status Scope:</span>
                  <span className="font-bold uppercase text-slate-900">{exportStatus}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Category Filter:</span>
                  <span className="font-bold text-slate-900">
                    {exportCategory === 'all'
                      ? 'All Municipal Categories'
                      : categories.find((c) => c.id === exportCategory)?.name || exportCategory}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Total Included Records:</span>
                  <span className="font-bold text-violet-700">{filteredIssues.length} filings</span>
                </div>
              </div>

              {/* KPI Summary Table */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2">
                  Executive Performance Summary
                </h4>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="text-[11px] text-slate-500 block">Total Filings</span>
                    <span className="text-xl font-bold text-slate-900">{totalReported}</span>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="text-[11px] text-slate-500 block">Resolved</span>
                    <span className="text-xl font-bold text-emerald-700">{resolvedCount}</span>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="text-[11px] text-slate-500 block">Resolution %</span>
                    <span className="text-xl font-bold text-indigo-700">{resolutionRate}%</span>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <span className="text-[11px] text-slate-500 block">Avg Dispatch Time</span>
                    <span className="text-xl font-bold text-slate-900">{stats?.avgResolutionHours || 24} Hours</span>
                  </div>
                </div>
              </div>

              {/* Issues Ledger Table */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2">
                  Municipal Infrastructure Issues Ledger ({filteredIssues.length} items)
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Title & Address</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Severity</th>
                        <th className="py-2.5 px-3">Score</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      {filteredIssues.slice(0, 50).map((issue) => (
                        <tr key={issue.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-950 block">{issue.title}</span>
                            <span className="text-[10px] text-slate-500">{issue.address || 'Metro Area'}</span>
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-700">
                            {issue.categoryName || issue.category?.name || 'General'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-bold uppercase text-[10px]">
                              {issue.status}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-medium">
                            {issue.severity || 'MEDIUM'}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-violet-700">
                            {issue.priorityScore || 50}
                          </td>
                          <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                            {issue.createdAt ? format(new Date(issue.createdAt), 'MMM d, yyyy') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredIssues.length > 50 && (
                  <p className="text-[10px] text-slate-500 italic mt-1">
                    * Displaying first 50 records in preview. Full dataset ({filteredIssues.length} items) included in CSV export.
                  </p>
                )}
              </div>

              {/* Official Sign-off & Certification */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-700">
                <div>
                  <p className="font-bold text-slate-900 mb-6">Prepared & Validated By:</p>
                  <div className="border-b border-slate-400 w-48 mb-1"></div>
                  <p className="font-semibold text-slate-950">{user?.name || 'Authorized City Official'}</p>
                  <p className="text-[11px] text-slate-500">Municipal Administrator • CivicPulse System</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-slate-900 mb-6">Departmental Approval:</p>
                  <div className="border-b border-slate-400 w-48 ml-auto mb-1"></div>
                  <p className="font-semibold text-slate-950">Director of Infrastructure</p>
                  <p className="text-[11px] text-slate-500">Official Seal of Public Works</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 no-print">
              <Button variant="ghost" onClick={() => setPdfModalOpen(false)}>
                Close Preview
              </Button>
              <Button
                variant="primary"
                onClick={handlePrintPDF}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
