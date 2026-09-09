import React from 'react';
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
} from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { IssueCard } from '../../components/issues/IssueCard';
import { useIssues } from '../../context/IssueContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { issues, categories } = useIssues();

  const recentIssues = issues.slice(0, 3);
  const criticalIssues = issues
    .filter((i) => i.severity === 'CRITICAL' || i.priorityScore >= 75)
    .slice(0, 3);

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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-4 h-4 text-brand-400" />
              <span>Next-Gen Civic Engagement Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Report local problems. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-200">
                Track real-time resolution.
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
              CivicPulse connects citizens directly with city administrators. Report potholes, water leaks, broken lights, and sanitation issues with photos and precise map locations.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Button
                onClick={() => navigate('/report')}
                size="lg"
                leftIcon={<PlusCircle className="w-5 h-5" />}
              >
                Report an Issue
              </Button>
              <Link to="/map">
                <Button variant="outline" size="lg" className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                  Explore Live Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Counter Cards */}
      <section className="-mt-10 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-brand-50 rounded-xl text-brand-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-slate-900">{issues.length * 14 + 182}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reports</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-slate-900">87.4%</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolution Rate</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-purple-50 rounded-xl text-purple-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-slate-900">36 Hrs</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Resolution Time</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-amber-50 rounded-xl text-amber-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-2xl font-extrabold text-slate-900">2,450+</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Citizens</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Explorer Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Report by Category</h2>
            <p className="text-sm text-slate-500 mt-1">Select an infrastructure category to view or submit a report</p>
          </div>
          <Link to="/explore" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>Browse All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.slug] || AlertTriangle;
            const count = issues.filter((i) => i.categoryId === cat.id).length;

            return (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.id}`}
                className="group p-5 bg-white rounded-xl border border-slate-200 shadow-subtle hover:shadow-card hover:border-brand-300 transition duration-150 flex flex-col justify-between"
              >
                <div className="p-3 bg-slate-50 group-hover:bg-brand-50 text-slate-700 group-hover:text-brand-600 rounded-lg w-fit transition mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                  <span className="inline-block mt-3 text-[11px] font-semibold text-slate-400">
                    {count} active reports
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* High Priority & Recent Community Reports */}
      <section className="py-12 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Recent Community Issues</h2>
              <p className="text-sm text-slate-500 mt-1">Live civic reports submitted by citizens in Metro City</p>
            </div>
            <Link to="/explore" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      </section>

      {/* How CivicPulse Works Section */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How CivicPulse Works</h2>
          <p className="text-sm text-slate-600">
            Transparent 3-step process from citizen report to municipal resolution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Report & Pin Location</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens submit issue details, upload photo evidence, and drop an exact pin on our interactive Leaflet OpenStreetMap.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Smart Prioritization & Check</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rule-based duplicate algorithms detect nearby matching reports. Deterministic priority formulas calculate queue scores based on severity and confirmations.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Admin Review & Resolution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              City officials inspect reports, dispatch repair crews, update status, and log every transition in an immutable status timeline history.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
