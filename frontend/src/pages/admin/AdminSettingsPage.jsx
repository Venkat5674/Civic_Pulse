import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  Server,
  Save,
  CheckCircle2,
  AlertCircle,
  Wifi,
  Database,
  Cloud,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminLayout } from '../../components/layout/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useNotifications } from '../../context/NotificationContext';
import { adminService } from '../../services/adminService';

export function AdminSettingsPage() {
  const { socket } = useNotifications();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    portalName: 'Metro City CivicPulse Platform',
    supportEmail: 'support@civicpulse.org',
    duplicateRadiusKm: '2.0',
    slaEscalationHours: '48',
    enableSocketBroadcasts: true,
    enableEmailAlerts: true,
    autoAssignCritical: true,
    jwtExpiryDays: '7',
    rateLimitPerMin: '100',
  });

  React.useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await adminService.getSettings();
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast.success('Admin system settings saved successfully to database!');
    } catch (err) {
      toast.error('Failed to save settings: ' + (err.message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  const isSocketConnected = Boolean(socket && socket.connected);

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-5xl">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200/80 dark:border-midnight-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-xs font-bold mb-2">
              <Settings className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>System Control Center</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin & System Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage municipal parameters, SLA thresholds, Socket.IO broadcasts, and integration statuses.
            </p>
          </div>

          <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
            Save All Settings
          </Button>
        </div>

        {/* Live Integration & Health Diagnostics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-midnight-850 p-4 rounded-2xl border border-slate-200/80 dark:border-midnight-700 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Backend API</span>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Online (Port 5000)</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-midnight-850 p-4 rounded-2xl border border-slate-200/80 dark:border-midnight-700 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isSocketConnected ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400'}`}>
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Socket.IO Server</span>
              <div className={`flex items-center gap-1 text-xs font-bold ${isSocketConnected ? 'text-indigo-600 dark:text-indigo-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {isSocketConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{isSocketConnected ? 'Connected' : 'Connecting...'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-midnight-850 p-4 rounded-2xl border border-slate-200/80 dark:border-midnight-700 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prisma Database</span>
              <div className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SQLite Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-midnight-850 p-4 rounded-2xl border border-slate-200/80 dark:border-midnight-700 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cloud Storage</span>
              <div className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cloudinary / Local</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Municipal Parameters */}
          <div className="bg-white dark:bg-midnight-850 rounded-2xl p-6 border border-slate-200/80 dark:border-midnight-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-midnight-800 text-slate-900 dark:text-white font-bold text-sm">
              <Sliders className="w-4 h-4 text-violet-500" />
              <span>Municipal Parameters & SLA Rules</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Municipal Platform Name"
                value={settings.portalName}
                onChange={(e) => handleChange('portalName', e.target.value)}
              />

              <Input
                label="Support & Escalation Contact Email"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
              />

              <Select
                label="Geospatial Duplicate Detection Radius"
                value={settings.duplicateRadiusKm}
                onChange={(e) => handleChange('duplicateRadiusKm', e.target.value)}
              >
                <option value="0.5">0.5 Kilometers</option>
                <option value="1.0">1.0 Kilometers</option>
                <option value="2.0">2.0 Kilometers (Default Standard)</option>
                <option value="5.0">5.0 Kilometers</option>
              </Select>

              <Select
                label="SLA SLA Resolution Escalation Threshold"
                value={settings.slaEscalationHours}
                onChange={(e) => handleChange('slaEscalationHours', e.target.value)}
              >
                <option value="24">24 Hours (Urgent Mode)</option>
                <option value="48">48 Hours (Standard SLA)</option>
                <option value="72">72 Hours</option>
                <option value="120">120 Hours (5 Days)</option>
              </Select>
            </div>
          </div>

          {/* Section 2: Real-time Sockets & Notifications */}
          <div className="bg-white dark:bg-midnight-850 rounded-2xl p-6 border border-slate-200/80 dark:border-midnight-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-midnight-800 text-slate-900 dark:text-white font-bold text-sm">
              <Bell className="w-4 h-4 text-indigo-500" />
              <span>Real-Time Socket & Notification Dispatch</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-midnight-800/60 border border-slate-200/60 dark:border-midnight-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableSocketBroadcasts}
                  onChange={(e) => handleChange('enableSocketBroadcasts', e.target.checked)}
                  className="w-4 h-4 accent-violet-600 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Socket.IO Live Status Updates
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Push instant status update notifications to connected citizen web clients.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-midnight-800/60 border border-slate-200/60 dark:border-midnight-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableEmailAlerts}
                  onChange={(e) => handleChange('enableEmailAlerts', e.target.checked)}
                  className="w-4 h-4 accent-violet-600 rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Automated Email Dispatches
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Send email confirmations on report submission and status resolution.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Security & Access Control */}
          <div className="bg-white dark:bg-midnight-850 rounded-2xl p-6 border border-slate-200/80 dark:border-midnight-700 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-midnight-800 text-slate-900 dark:text-white font-bold text-sm">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Security & Token Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="JWT Authentication Expiry"
                value={settings.jwtExpiryDays}
                onChange={(e) => handleChange('jwtExpiryDays', e.target.value)}
              >
                <option value="1">1 Day</option>
                <option value="7">7 Days (Default Standard)</option>
                <option value="30">30 Days</option>
              </Select>

              <Input
                label="API Rate Limiter (Reqs/Min per IP)"
                value={settings.rateLimitPerMin}
                onChange={(e) => handleChange('rateLimitPerMin', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={saving} size="lg" leftIcon={<Save className="w-4 h-4" />}>
              Save All Settings
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
