import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/authService';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: 'citizen@civicpulse.org',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setUserEmail(data.email);
    try {
      const res = await authService.forgotPassword(data.email);
      const token = res?.data?.devToken || res?.devToken || '';
      if (token) {
        setResetToken(token);
      }
      toast.success('Password reset instructions sent to your email!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-xl p-8 space-y-6 transition-colors">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-violet-500/20">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white">Forgot Password?</h1>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
              Enter your registered email address and we'll dispatch password recovery instructions.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" isLoading={loading} className="w-full" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Send Recovery Instructions
              </Button>
            </form>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 text-center space-y-3 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-bold text-emerald-950 dark:text-emerald-200 text-sm">Instructions Sent!</h3>
              <p className="text-emerald-800 dark:text-emerald-300">
                A password reset link has been dispatched to <span className="font-mono font-semibold">{userEmail}</span>. Please check your inbox.
              </p>

              {resetToken ? (
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/40">
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mb-2">Development Direct Reset Link:</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
                  >
                    Open Reset Password Form &rarr;
                  </button>
                </div>
              ) : null}
            </div>
          )}

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
