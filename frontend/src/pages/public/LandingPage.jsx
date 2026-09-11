import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  PlusCircle,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Users,
  Clock,
  Car,
  Lightbulb,
  Droplets,
  Trash2,
  Waves,
  Trees,
  Sparkles,
  Filter,
  Activity,
  Eye,
  ShieldCheck,
  Compass,
  ChevronRight,
  Layers,
  Award,
  FileText,
  ThumbsUp,
  Map
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { IssueCard } from '../../components/issues/IssueCard';
import { useIssues } from '../../context/IssueContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { issues, categories } = useIssues();
  const [filterTab, setFilterTab] = useState('ALL');

  // Filter issues based on selected tab
  const filteredIssues = issues.filter((issue) => {
    if (filterTab === 'CRITICAL') return issue.severity === 'CRITICAL' || issue.priorityScore >= 75;
    if (filterTab === 'IN_PROGRESS') return issue.status === 'IN_PROGRESS';
    if (filterTab === 'RESOLVED') return issue.status === 'RESOLVED';
    return true;
  }).slice(0, 3);

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
      {/* 1. Hero Section - 100vh Full Viewport Height */}
      <section className="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-center relative overflow-hidden bg-gradient-to-b from-[#f7f2fe] via-[#fbf5fd] to-[#f5effd] dark:from-[#090715] dark:via-[#0f0c22] dark:to-[#080612] text-[#2d1847] dark:text-white py-12 lg:py-16 transition-colors duration-300">
        {/* Background ambient lighting and pattern */}
        <div className="absolute inset-0 opacity-15 dark:opacity-20 bg-[radial-gradient(#7c3aed_1px,transparent_1px)] dark:bg-[radial-gradient(#a78bfa_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Core Value Proposition */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50 text-xs font-semibold tracking-wide shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                <span>Next-Gen Civic Infrastructure Network</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-1" />
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-[#2d1847] dark:text-white leading-[1.08]">
                Report local issues.{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 dark:from-purple-300 dark:via-indigo-200 dark:to-pink-300">
                  Track real-time resolution.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#5c3c7e] dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                CivicPulse connects citizens directly with city administrators. Report potholes, water leaks, broken lights, and sanitation issues with photo evidence, exact GPS map locations, and automated priority queueing.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <Button
                  onClick={() => navigate('/report')}
                  size="lg"
                  className="rounded-full bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold px-7 py-3.5 shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all text-sm sm:text-base"
                  leftIcon={<PlusCircle className="w-5 h-5" />}
                >
                  Report an Issue
                </Button>
                <Link to="/map">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full bg-white/80 dark:bg-midnight-800/90 backdrop-blur-md text-purple-900 dark:text-purple-200 border-purple-200 dark:border-midnight-700 hover:bg-purple-100 dark:hover:bg-midnight-700 hover:text-purple-950 dark:hover:text-white px-6 py-3.5 text-sm sm:text-base shadow-sm"
                    leftIcon={<Map className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                  >
                    Explore Live Map
                  </Button>
                </Link>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-4 border-t border-purple-200/80 dark:border-midnight-800/80 grid grid-cols-3 gap-4 text-xs font-semibold text-purple-900/70 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>100% Free & Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>GPS Map Pinning</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Audit Trail</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Platform Capabilities & Engine Showcase Card */}
            <div className="lg:col-span-5 relative">
              {/* Outer Glow effect behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-20 dark:opacity-40 animate-pulse pointer-events-none" />

              <div className="relative bg-white/95 dark:bg-midnight-850/95 backdrop-blur-2xl border border-slate-200/90 dark:border-midnight-700/90 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 transition-all">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-midnight-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>CivicPulse Platform Engine</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 uppercase tracking-wide">
                    Live 24/7 Engine
                  </span>
                </div>

                {/* Main Attraction Hero Copy */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Smart Municipal Intelligence</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                    AI-Driven Issue Resolution & Mapped Operations
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Connecting 120,000+ residents directly with municipal departments through real-time GPS tracking, automated priority weighting, and transparent audit logs.
                  </p>
                </div>

                {/* Platform Metrics 4-Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 bg-slate-50 dark:bg-midnight-900/80 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Avg Resolution</span>
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">4.2 Hours</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">⚡ 68% Faster Dispatch</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-midnight-900/80 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Mapped Issues</span>
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">1,420+ Active</span>
                    <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">📍 Real-time GPS Pins</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-midnight-900/80 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Satisfaction</span>
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">98.4% Rating</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Verified Audit Logs</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-midnight-900/80 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 transition-all hover:scale-[1.02]">
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      <span>Priority Index</span>
                    </div>
                    <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">99.1% Auto</span>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Severity Weighted</span>
                  </div>
                </div>

                {/* System Live Operational Flow Progress */}
                <div className="p-3.5 bg-brand-50/80 dark:bg-brand-950/40 rounded-2xl border border-brand-200/80 dark:border-brand-800/60 space-y-2">
                  <div className="flex justify-between items-center text-xs font-extrabold text-slate-900 dark:text-slate-100">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      <span>Municipal Operations Flow</span>
                    </span>
                    <span className="text-[11px] text-brand-700 dark:text-brand-300 font-mono">100% Sync</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-midnight-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 h-full rounded-full w-[100%] animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 pt-0.5">
                    <span>1. Citizen Report</span>
                    <span>2. Priority Score</span>
                    <span>3. City Dispatch</span>
                  </div>
                </div>

                {/* Card Footer Trust Banner */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-midnight-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-900 dark:text-slate-200">Official Municipal Portal</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">v2.4 Core Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Impact & Performance Metrics Section - 100vh Full Viewport */}
      <section className="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-[#f2e9fc] dark:bg-[#0f0c22] text-[#2d1847] dark:text-white border-t border-purple-200/80 dark:border-midnight-800/80 py-16 lg:py-24 transition-colors duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-200/70 dark:bg-purple-950/80 px-3 py-1 rounded-full border border-purple-300 dark:border-purple-800/60">
              Real-Time Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2d1847] dark:text-white tracking-tight">
              Municipal Resolution Stats
            </h2>
            <p className="text-sm text-purple-800 dark:text-slate-400">
              Empirical platform performance metrics across Metro City
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            <div className="bg-white/80 dark:bg-midnight-850/80 p-8 rounded-3xl border border-purple-200/80 dark:border-midnight-700/80 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition duration-200 min-h-[200px]">
              <div className="p-4 bg-purple-100 dark:bg-purple-500/20 rounded-2xl text-purple-700 dark:text-purple-400 w-fit mb-4">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-purple-950 dark:text-white">{issues.length * 14 + 182}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">+14%</span>
                </div>
                <span className="text-xs font-bold text-purple-800 dark:text-slate-400 uppercase tracking-wider mt-1 block">Total Reports Filed</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-midnight-850/80 p-8 rounded-3xl border border-purple-200/80 dark:border-midnight-700/80 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition duration-200 min-h-[200px]">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-400 w-fit mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="block text-3xl sm:text-4xl font-black text-purple-950 dark:text-white">87.4%</span>
                <span className="text-xs font-bold text-purple-800 dark:text-slate-400 uppercase tracking-wider mt-1 block">Resolution Success Rate</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-midnight-850/80 p-8 rounded-3xl border border-purple-200/80 dark:border-midnight-700/80 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition duration-200 min-h-[200px]">
              <div className="p-4 bg-pink-100 dark:bg-purple-500/20 rounded-2xl text-pink-700 dark:text-purple-400 w-fit mb-4">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <span className="block text-3xl sm:text-4xl font-black text-purple-950 dark:text-white">36 Hrs</span>
                <span className="text-xs font-bold text-purple-800 dark:text-slate-400 uppercase tracking-wider mt-1 block">Avg Resolution Time</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-midnight-850/80 p-8 rounded-3xl border border-purple-200/80 dark:border-midnight-700/80 shadow-xl flex flex-col justify-between hover:-translate-y-1 transition duration-200 min-h-[200px]">
              <div className="p-4 bg-amber-100 dark:bg-amber-500/20 rounded-2xl text-amber-700 dark:text-amber-400 w-fit mb-4">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <span className="block text-3xl sm:text-4xl font-black text-purple-950 dark:text-white">2,450+</span>
                <span className="text-xs font-bold text-purple-800 dark:text-slate-400 uppercase tracking-wider mt-1 block">Active Citizens Engaged</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Explorer Section - 100vh Full Viewport */}
      <section className="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-[#f8f4fe] dark:bg-[#080612] text-[#2d1847] dark:text-white border-t border-purple-200/80 dark:border-midnight-800/80 py-16 lg:py-24 transition-colors duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4" />
                <span>Infrastructure Categories</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2d1847] dark:text-white tracking-tight">
                Report by Infrastructure Domain
              </h2>
              <p className="text-sm text-purple-800 dark:text-slate-400 mt-1 max-w-xl">
                Select an infrastructure domain below to inspect existing community reports or submit a new ticket.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 hover:gap-2 transition-all shrink-0"
            >
              <span>Browse All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || AlertTriangle;
              const count = issues.filter((i) => i.categoryId === cat.id).length;

              return (
                <Link
                  key={cat.id}
                  to={`/explore?category=${cat.id}`}
                  className="group p-7 bg-white/90 dark:bg-midnight-850 rounded-3xl border border-purple-200/80 dark:border-midnight-700/90 shadow-md hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-500/60 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="p-3.5 bg-purple-100 dark:bg-midnight-800 group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 rounded-2xl w-fit transition duration-200 mb-5">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-purple-950 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-purple-800/80 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">{cat.description}</p>
                  </div>
                  <div className="pt-4 mt-6 border-t border-purple-100 dark:border-midnight-800 flex items-center justify-between text-xs font-semibold">
                    <span className="text-purple-700 dark:text-slate-400 group-hover:text-purple-950 dark:group-hover:text-slate-200 transition">{count} active reports</span>
                    <ChevronRight className="w-4 h-4 text-purple-400 dark:text-slate-500 group-hover:text-purple-700 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. High Priority & Community Issues Showcase - 100vh Full Viewport */}
      <section className="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-[#f2e9fc] dark:bg-[#0f0c22] text-[#2d1847] dark:text-white border-t border-purple-200/80 dark:border-midnight-800/80 py-16 lg:py-24 transition-colors duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-indigo-400 uppercase tracking-wider mb-2">
                <Activity className="w-4 h-4" />
                <span>Live Municipal Stream</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2d1847] dark:text-white tracking-tight">
                Recent Community Issues
              </h2>
              <p className="text-sm text-purple-800 dark:text-slate-400 mt-1">
                Real-time civic reports submitted by citizens across Metro City
              </p>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-white/90 dark:bg-midnight-800 rounded-full border border-purple-200 dark:border-midnight-700/80 shadow-2xs self-start md:self-auto overflow-x-auto max-w-full">
              {[
                { id: 'ALL', label: 'All Issues' },
                { id: 'CRITICAL', label: 'High Priority' },
                { id: 'IN_PROGRESS', label: 'In Progress' },
                { id: 'RESOLVED', label: 'Resolved' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    filterTab === tab.id
                      ? 'bg-purple-700 dark:bg-purple-600 text-white shadow-xs'
                      : 'text-purple-900 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-midnight-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)
            ) : (
              <div className="col-span-full py-12 text-center bg-white/80 dark:bg-midnight-800/60 rounded-3xl border border-purple-200 dark:border-midnight-700 text-purple-800 dark:text-slate-400">
                <p className="font-semibold text-sm">No issues matching this filter tab right now.</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link to="/explore">
              <Button
                variant="outline"
                size="md"
                className="rounded-full bg-white dark:bg-midnight-800/90 border-purple-300 dark:border-midnight-700 text-purple-900 dark:text-purple-200 font-semibold px-6 hover:bg-purple-100 dark:hover:bg-midnight-700 hover:text-purple-950 dark:hover:text-white transition-all shadow-sm"
              >
                View All Public Issues
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. How CivicPulse Works - 100vh Full Viewport */}
      <section id="how-it-works" className="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-[#f8f4fe] dark:bg-[#080612] text-[#2d1847] dark:text-white border-t border-purple-200/80 dark:border-midnight-800/80 py-16 lg:py-24 transition-colors duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/80 px-3.5 py-1 rounded-full border border-purple-300 dark:border-purple-800/60">
              Platform Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2d1847] dark:text-white tracking-tight">
              How CivicPulse Works
            </h2>
            <p className="text-sm text-purple-800 dark:text-slate-400">
              A transparent 3-step pipeline from citizen reporting to municipal resolution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-purple-200 dark:bg-midnight-800 -z-0" />

            {/* Step 1 */}
            <div className="relative z-10 bg-white/90 dark:bg-midnight-850 p-8 rounded-3xl border border-purple-200/80 dark:border-midnight-800 shadow-xl text-center space-y-4 hover:-translate-y-1 transition duration-200">
              <div className="w-14 h-14 rounded-2xl bg-purple-700 dark:bg-purple-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-600/20">
                1
              </div>
              <h3 className="text-xl font-bold text-purple-950 dark:text-white">Pin & Report Issue</h3>
              <p className="text-xs text-purple-800/80 dark:text-slate-400 leading-relaxed">
                Citizens snap photo evidence, select issue categories, and drop precise GPS coordinates on our interactive OpenStreetMap.
              </p>
              <div className="pt-2 flex items-center justify-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>Interactive GPS Mapping</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 bg-white/90 dark:bg-midnight-850 p-8 rounded-3xl border border-purple-200/80 dark:border-midnight-800 shadow-xl text-center space-y-4 hover:-translate-y-1 transition duration-200">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                2
              </div>
              <h3 className="text-xl font-bold text-purple-950 dark:text-white">Smart Queue Prioritization</h3>
              <p className="text-xs text-purple-800/80 dark:text-slate-400 leading-relaxed">
                Rule-based duplicate algorithms detect nearby matching reports. Deterministic priority scoring ranks tickets based on severity and upvotes.
              </p>
              <div className="pt-2 flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Priority Scoring Formula</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 bg-white/90 dark:bg-midnight-850 p-8 rounded-3xl border border-purple-200/80 dark:border-midnight-800 shadow-xl text-center space-y-4 hover:-translate-y-1 transition duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                3
              </div>
              <h3 className="text-xl font-bold text-purple-950 dark:text-white">Municipal Dispatch & Fix</h3>
              <p className="text-xs text-purple-800/80 dark:text-slate-400 leading-relaxed">
                City officials review prioritized reports, dispatch repair crews, update status, and log every transition in an immutable audit timeline.
              </p>
              <div className="pt-2 flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Audit Resolution Log</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Platform Governance & Guarantees - 100vh Full Viewport */}
      <section className="w-full min-h-[calc(100vh-4rem)] flex flex-col justify-center bg-[#f2e9fc] dark:bg-[#0f0c22] text-[#2d1847] dark:text-white border-t border-purple-200/80 dark:border-midnight-800/80 py-16 lg:py-24 transition-colors duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 bg-purple-200/70 dark:bg-purple-950/80 px-3.5 py-1 rounded-full border border-purple-300 dark:border-purple-800/60">
              Built for Municipal Trust
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2d1847] dark:text-white tracking-tight">
              Enterprise Civic Infrastructure
            </h2>
            <p className="text-sm text-purple-800 dark:text-slate-400 leading-relaxed">
              Engineered with strict algorithmic standards, transparent queue prioritization, and citizen verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-7 bg-white/80 dark:bg-midnight-850/60 rounded-3xl border border-purple-200/80 dark:border-midnight-700/80 space-y-4">
              <div className="p-3.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-2xl w-fit">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-purple-950 dark:text-white">Deterministic Priority Scoring</h3>
              <p className="text-xs text-purple-800/80 dark:text-slate-400 leading-relaxed">
                Every ticket is scored programmatically using severity levels, public upvotes, and emergency factors—eliminating bias.
              </p>
            </div>

            <div className="p-7 bg-white/80 dark:bg-midnight-850/60 rounded-3xl border border-purple-200/80 dark:border-midnight-700/80 space-y-4">
              <div className="p-3.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-2xl w-fit">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-purple-950 dark:text-white">Smart Duplicate Merging</h3>
              <p className="text-xs text-purple-800/80 dark:text-slate-400 leading-relaxed">
                Geo-clustering algorithms identify reports within 100 meters, linking duplicate reports to avoid redundant work orders.
              </p>
            </div>

            <div className="p-7 bg-white/80 dark:bg-midnight-850/60 rounded-3xl border border-purple-200/80 dark:border-midnight-700/80 space-y-4">
              <div className="p-3.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-2xl w-fit">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-purple-950 dark:text-white">Immutable Status Timelines</h3>
              <p className="text-xs text-purple-800/80 dark:text-slate-400 leading-relaxed">
                Track exact time stamps from report creation to officer dispatch and final resolution with verifiable activity logs.
              </p>
            </div>

            <div className="p-7 bg-white/80 dark:bg-midnight-850/60 rounded-3xl border border-purple-200/80 dark:border-midnight-700/80 space-y-4">
              <div className="p-3.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-2xl w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-purple-950 dark:text-white">Data Privacy & Security</h3>
              <p className="text-xs text-purple-800/80 dark:text-slate-400 leading-relaxed">
                Citizen information is protected with optional anonymous reporting while providing verified data to municipal authorities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call-to-Action Hero Banner */}
      <section className="w-full min-h-[50vh] flex flex-col justify-center bg-gradient-to-r from-purple-100 via-lavender-100 to-indigo-100 dark:from-[#130b2e] dark:via-[#1a0f3c] dark:to-[#080612] text-slate-900 dark:text-white py-16 lg:py-24 border-t border-purple-200/80 dark:border-midnight-800 transition-colors duration-300">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="bg-white/90 dark:bg-midnight-900/80 backdrop-blur-xl border border-purple-200/90 dark:border-midnight-800 text-slate-900 dark:text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl dark:shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-500/15 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 max-w-xl z-10 text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
                Ready to improve your neighborhood infrastructure?
              </h2>
              <p className="text-sm text-purple-950/80 dark:text-slate-300 leading-relaxed">
                Submit your first report in under 60 seconds. Help municipal crews fix potholes, repair streetlights, and maintain clean streets.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 z-10 shrink-0 w-full sm:w-auto">
              <Button
                onClick={() => navigate('/report')}
                size="lg"
                className="w-full sm:w-auto rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3.5 shadow-lg shadow-brand-500/25 hover:scale-[1.02] transition-all"
                leftIcon={<PlusCircle className="w-5 h-5" />}
              >
                Report an Issue
              </Button>
              <Link to="/explore" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-white dark:bg-midnight-800/90 text-brand-700 dark:text-brand-300 border-brand-300/80 dark:border-midnight-700 hover:bg-brand-50 dark:hover:bg-midnight-700 hover:text-brand-800 dark:hover:text-white px-6 py-3.5 font-bold shadow-sm transition-all"
                >
                  Browse Public Issues
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}


