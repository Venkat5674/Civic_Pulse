import React from 'react';
import { Shield, Heart, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CivicPulse</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering citizens and municipal governments to collaboratively report, track, and resolve urban infrastructure issues with full transparency.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>Serving Metro Municipalities</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="hover:text-white transition">
                  Browse Public Issues
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition">
                  Geospatial Issue Map
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition">
                  Submit New Report
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Governance</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition">
                  City Admin Portal
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition">
                  Duplicate Scoring Rule
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition">
                  Priority Formula
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} CivicPulse Platform. Built with React + Vite + Tailwind CSS.</p>
          <p className="flex items-center gap-1">
            <span>Designed for transparent civic governance</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
