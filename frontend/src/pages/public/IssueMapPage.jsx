import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { IssueMap } from '../../components/maps/IssueMap';
import { StatusBadge } from '../../components/issues/StatusBadge';
import { PriorityIndicator } from '../../components/issues/PriorityIndicator';
import { useIssues } from '../../context/IssueContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, ArrowRight, ThumbsUp, Layers, Filter, Navigation, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function IssueMapPage() {
  const { issues, categories } = useIssues();
  const { userLocation, openLocationPrompt } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState(issues[0] || null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const filteredIssues =
    selectedCategory === 'all'
      ? issues
      : issues.filter((i) => i.categoryId === selectedCategory);

  return (
    <AppShell showFooter={false}>
      {/* Container: Column on Mobile/Tablet (< 1024px), Row on Desktop (1024px+) */}
      <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden relative bg-slate-50 dark:bg-midnight-950">
        
        {/* Left Control Panel */}
        <div
          className={`w-full lg:w-96 xl:w-[420px] bg-white/95 dark:bg-midnight-850/95 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-midnight-700/80 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto shrink-0 z-20 shadow-lg dark:shadow-2xl transition-all duration-300 ${
            panelCollapsed ? 'max-h-16 lg:max-h-none' : 'max-h-[50vh] lg:max-h-none'
          }`}
        >
          <div className="space-y-4">
            {/* 1. Panel Header & Mobile Toggle */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 text-[11px] font-extrabold mb-1 border border-brand-200/80 dark:border-brand-800/60 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Geospatial Coverage</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Live Infrastructure Map
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
                  Explore real-time civic issues mapped across Metro City. Click pins to inspect details.
                </p>
              </div>

              {/* Mobile Collapse Toggle Button */}
              <button
                onClick={() => setPanelCollapsed(!panelCollapsed)}
                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-midnight-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-midnight-700 transition border border-slate-200/80 dark:border-midnight-700"
                title={panelCollapsed ? 'Expand Control Panel' : 'Collapse Panel'}
              >
                {panelCollapsed ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 px-1">
                    <span>Controls</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
                    <span>Minimize</span>
                    <ChevronUp className="w-4 h-4" />
                  </div>
                )}
              </button>
            </div>

            {/* Panel Body Content */}
            {!panelCollapsed && (
              <>
                {/* 2. Default Location Status Card */}
                <div className="p-3.5 bg-slate-50/90 dark:bg-midnight-900/80 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3 text-xs min-w-0">
                    <div className="p-2 bg-brand-600 text-white rounded-xl shrink-0 shadow-xs">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                        Map Center (Location)
                      </span>
                      <span className="block font-bold text-slate-900 dark:text-white truncate">
                        {userLocation?.cityName || 'Metro City Center'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={openLocationPrompt}
                    className="text-xs font-extrabold text-brand-600 dark:text-brand-400 bg-white dark:bg-midnight-800 hover:bg-slate-100 dark:hover:bg-midnight-700 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-midnight-700 transition shrink-0 shadow-2xs"
                  >
                    Change
                  </button>
                </div>

                {/* 3. Category Filter Scroll Pills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>Category Filter</span>
                    </label>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {filteredIssues.length} map pins
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap shrink-0 border ${
                        selectedCategory === 'all'
                          ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                          : 'bg-slate-100 dark:bg-midnight-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-midnight-700 border-slate-200/80 dark:border-midnight-700'
                      }`}
                    >
                      All ({issues.length})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap shrink-0 border ${
                          selectedCategory === cat.id
                            ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                            : 'bg-slate-100 dark:bg-midnight-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-midnight-700 border-slate-200/80 dark:border-midnight-700'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Selected Issue Detailed Card */}
                {selectedIssue ? (
                  <div className="p-4 bg-slate-50/90 dark:bg-midnight-900/80 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={selectedIssue.status} size="sm" />
                      <PriorityIndicator score={selectedIssue.priorityScore} />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {selectedIssue.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {selectedIssue.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                      <span className="truncate">{selectedIssue.address}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-midnight-800 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        {selectedIssue.confirmationsCount} Confirmations
                      </span>
                      <Link to={`/issues/${selectedIssue.id}`}>
                        <Button size="sm" className="rounded-full text-xs px-3.5" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          View Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 text-center border-2 border-dashed border-slate-200 dark:border-midnight-700 rounded-2xl text-slate-400 dark:text-slate-500 text-xs font-medium">
                    Click any pin on the map to inspect report details here.
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 h-full min-h-[350px] relative z-10">
          <IssueMap
            issues={filteredIssues}
            center={[userLocation?.lat || 37.774929, userLocation?.lng || -122.419416]}
            height="100%"
            onMarkerSelect={(issue) => {
              setSelectedIssue(issue);
              if (panelCollapsed) setPanelCollapsed(false);
            }}
          />
        </div>
      </div>
    </AppShell>
  );
}
