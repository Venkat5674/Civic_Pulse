import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';

const resetSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Missing password reset token. Please request a new link.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        token,
        newPassword: data.newPassword,
      });
      toast.success('Password updated successfully! You may now sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-xl p-8 space-y-6 transition-colors">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white">Reset Password</h1>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
              Set a strong new password for your CivicPulse account.
            </p>
          </div>

          {!token && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-center space-y-1">
              <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                No password reset token was detected in the link.
              </p>
              <Link to="/forgot-password" className="text-xs font-bold text-amber-900 dark:text-amber-200 underline">
                Request a new password reset email &rarr;
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" isLoading={loading} className="w-full" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Save New Password & Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-purple-700/80 dark:text-purple-300/80 pt-4 border-t border-purple-100 dark:border-purple-900/30">
            <Link to="/login" className="inline-flex items-center gap-1 font-bold text-violet-600 dark:text-violet-400 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
