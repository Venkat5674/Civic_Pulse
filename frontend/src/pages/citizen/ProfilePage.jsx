import React, { useState } from 'react';
import { CitizenLayout } from '../../components/layout/CitizenLayout';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Calendar, CheckCircle2, Lock, KeyRound, Send, ArrowRight, Bell } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Avatar } from '../../components/ui/Avatar';
import { authService } from '../../services/authService';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [sendingLink, setSendingLink] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications !== false);
  const [updatingNotifications, setUpdatingNotifications] = useState(false);

  const handleToggleEmailNotifications = async () => {
    const nextVal = !emailNotifications;
    setEmailNotifications(nextVal);
    setUpdatingNotifications(true);
    try {
      const updatedUser = await authService.updateProfile({ emailNotifications: nextVal });
      if (updateUser) updateUser(updatedUser);
      toast.success(nextVal ? 'Email notifications enabled' : 'Email notifications paused');
    } catch (err) {
      setEmailNotifications(!nextVal);
      toast.error('Failed to update email preferences');
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setSendingLink(true);
    try {
      await authService.forgotPassword(user.email);
      toast.success(`Password reset link sent to ${user.email}! Please check your inbox.`);
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch password reset email.');
    } finally {
      setSendingLink(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangeForm(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <CitizenLayout>
      <div className="max-w-2xl space-y-6">
        <div className="pb-2 border-b border-slate-200/60 dark:border-midnight-800">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Account & Profile Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your citizen profile information and platform credentials</p>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white dark:bg-midnight-850/90 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl backdrop-blur-xl space-y-6 transition-all">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-midnight-800">
            <Avatar name={user?.name} size="xl" className="w-16 h-16 text-2xl font-black ring-4 ring-brand-500/20" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{user?.email}</p>
              <span className="inline-block mt-1.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/80 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800/60">
                {user?.role} ACCOUNT
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-midnight-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Account ID:</span>
              <span className="font-mono text-[11px] text-slate-500">{user?.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-midnight-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Role Status:</span>
              <span className="font-bold text-brand-600 dark:text-brand-400">{user?.role}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Authentication:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified User
              </span>
            </div>
          </div>
        </div>

        {/* Email Notification Preferences Card */}
        <div className="bg-white dark:bg-midnight-850/90 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl backdrop-blur-xl space-y-4 transition-all">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-midnight-800">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Notification Preferences</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Control when you receive Brevo email notifications</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-midnight-900/60 border border-slate-200/60 dark:border-midnight-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Issue Status & Resolution Updates</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive an email notification when municipal teams update, investigate, or resolve your report.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={handleToggleEmailNotifications}
                disabled={updatingNotifications}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>
        </div>

        {/* Security & Password Card */}
        <div className="bg-white dark:bg-midnight-850/90 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl backdrop-blur-xl space-y-6 transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-midnight-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Password</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage your password recovery and email notifications</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-midnight-900/60 border border-slate-200/60 dark:border-midnight-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-violet-600" />
                  Email Password Reset Link
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Send a secure password change link directly to <strong>{user?.email}</strong>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendResetEmail}
                isLoading={sendingLink}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Send Email Link
              </Button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowChangeForm(!showChangeForm)}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                {showChangeForm ? 'Hide Change Password Form' : 'Change Password Directly Here'}
              </button>

              {showChangeForm && (
                <form onSubmit={handleChangePassword} className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-midnight-900/60 border border-slate-200/60 dark:border-midnight-800 space-y-3">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="•••••••• (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    isLoading={updatingPassword}
                    className="w-full mt-2"
                  >
                    Save New Password
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </CitizenLayout>
  );
}
