import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <HelpCircle className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h1>

        <p className="text-slate-600 text-sm max-w-md mx-auto">
          The page or civic report you are searching for could not be found or has moved.
        </p>

        <div className="flex justify-center pt-2">
          <Link to="/">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to CivicPulse Home
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
