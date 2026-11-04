import React from 'react';
import { Shield, Heart, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#f2e9fc] to-[#ebdcfb] dark:from-[#090615] dark:to-[#05030a] text-purple-950 dark:text-purple-200 border-t border-purple-200/60 dark:border-purple-900/40 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-purple-950 dark:text-white tracking-tight">CivicPulse</span>
            </div>
            <p className="text-sm text-purple-800/80 dark:text-purple-300/80 max-w-sm leading-relaxed">
              Empowering citizens and municipal governments to collaboratively report, track, and resolve urban infrastructure issues with full transparency.
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-400 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>Serving Metro Municipalities</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-100">Platform</h4>
            <ul className="space-y-2 text-sm text-purple-800/90 dark:text-purple-300">
              <li>
                <Link to="/explore" className="hover:text-violet-700 dark:hover:text-violet-300 transition">
                  Browse Public Issues
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-violet-700 dark:hover:text-violet-300 transition">
                  Geospatial Issue Map
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-violet-700 dark:hover:text-violet-300 transition">
                  Submit New Report
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-100">Governance</h4>
            <ul className="space-y-2 text-sm text-purple-800/90 dark:text-purple-300">
              <li>
                <Link to="/login" className="hover:text-violet-700 dark:hover:text-violet-300 transition">
                  City Admin Portal
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-violet-700 dark:hover:text-violet-300 transition">
                  Duplicate Scoring Rule
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-violet-700 dark:hover:text-violet-300 transition">
                  Priority Formula
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-purple-200/80 dark:border-purple-900/30 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-700/80 dark:text-purple-400 gap-4">
          <p>© {new Date().getFullYear()} CivicPulse Platform. Built with React + Vite + Tailwind CSS.</p>
          <p className="flex items-center gap-1">
            <span>Designed for transparent civic governance</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
