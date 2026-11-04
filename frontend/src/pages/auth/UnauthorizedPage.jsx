import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';

export function UnauthorizedPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900">403 - Access Denied</h1>

        <p className="text-slate-600 text-sm max-w-md mx-auto">
          You do not have administrative permissions to view this municipal management page. Please log in with a City Admin account.
        </p>

        <div className="flex justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="primary">Log In as Admin</Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
