import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { IssueMap } from '../../components/maps/IssueMap';
import { StatusBadge } from '../../components/issues/StatusBadge';
import { PriorityIndicator } from '../../components/issues/PriorityIndicator';
import { useIssues } from '../../context/IssueContext';
import { MapPin, ArrowRight, ThumbsUp, Layers, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export function IssueMapPage() {
  const { issues, categories } = useIssues();
  const [selectedIssue, setSelectedIssue] = useState(issues[0] || null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredIssues =
    selectedCategory === 'all'
      ? issues
      : issues.filter((i) => i.categoryId === selectedCategory);

  return (
    <AppShell showFooter={false}>
      <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden">
        {/* Left Side Panel */}
        <div className="w-full md:w-96 bg-white border-r border-slate-200 p-5 flex flex-col justify-between overflow-y-auto shrink-0 z-20 shadow-md">
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Geospatial Coverage</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Live Infrastructure Map</h2>
              <p className="text-xs text-slate-500 mt-1">
                Explore real-time civic issues mapped across Metro City. Click markers to inspect.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Filter Category</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedCategory === 'all'
                      ? 'bg-brand-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({issues.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedCategory === cat.id
                        ? 'bg-brand-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Issue Quick Card */}
            {selectedIssue ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedIssue.status} size="sm" />
                  <PriorityIndicator score={selectedIssue.priorityScore} />
                </div>

                <h3 className="text-sm font-bold text-slate-900">{selectedIssue.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{selectedIssue.description}</p>

                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedIssue.address}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-brand-600" />
                    {selectedIssue.confirmationsCount} Confirmations
                  </span>
                  <Link to={`/issues/${selectedIssue.id}`}>
                    <Button size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Report
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Click any marker on the map to display report details here.
              </div>
            )}
          </div>
        </div>

        {/* Right Map Canvas */}
        <div className="flex-1 h-full relative">
          <IssueMap
            issues={filteredIssues}
            height="100%"
            onMarkerSelect={(issue) => setSelectedIssue(issue)}
          />
        </div>
      </div>
    </AppShell>
  );
}
