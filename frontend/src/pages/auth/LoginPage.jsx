import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login, switchDemoRole } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'citizen@civicpulse.org',
      password: 'password123',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (role) => {
    if (role === 'CITIZEN') {
      setValue('email', 'citizen@civicpulse.org');
      setValue('password', 'password123');
      switchDemoRole('CITIZEN');
      toast.info('Loaded Citizen Jane demo credentials');
    } else {
      setValue('email', 'admin@civicpulse.org');
      setValue('password', 'password123');
      switchDemoRole('ADMIN');
      toast.info('Loaded City Admin Alex demo credentials');
    }
  };

  return (
    <AppShell showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-xl p-8 space-y-6 transition-colors">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-violet-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white">Welcome Back</h1>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80">Sign in to your CivicPulse account to manage reports</p>
          </div>

          {/* Quick Demo Credentials Switcher */}
          <div className="p-3 bg-violet-50/80 dark:bg-violet-950/40 rounded-xl border border-violet-200 dark:border-violet-800/60 text-xs space-y-2">
            <div className="flex items-center gap-1 font-bold text-violet-900 dark:text-violet-200">
              <UserCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Quick Demo Preset Login:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('CITIZEN')}
                className="p-2 bg-white dark:bg-purple-900/60 hover:bg-violet-100 dark:hover:bg-purple-900 rounded-lg border border-violet-200 dark:border-violet-700 text-violet-800 dark:text-violet-200 font-semibold text-left text-[11px] transition"
              >
                Jane Citizen
                <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-normal">citizen@civicpulse.org</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('ADMIN')}
                className="p-2 bg-white dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg border border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold text-left text-[11px] transition"
              >
                Alex Rivera (Admin)
                <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-normal">admin@civicpulse.org</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" isLoading={loading} className="w-full" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-purple-700/80 dark:text-purple-300/80 pt-2 border-t border-purple-100 dark:border-purple-900/30">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 underline">
              Register as Citizen
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
