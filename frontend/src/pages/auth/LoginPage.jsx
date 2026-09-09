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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-100">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
            <p className="text-xs text-slate-500">Sign in to your CivicPulse account to manage reports</p>
          </div>

          {/* Quick Demo Credentials Switcher */}
          <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs space-y-2">
            <div className="flex items-center gap-1 font-bold text-brand-900">
              <UserCheck className="w-4 h-4 text-brand-600" />
              <span>Quick Demo Preset Login:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('CITIZEN')}
                className="p-2 bg-white hover:bg-brand-100 rounded-lg border border-brand-200 text-brand-800 font-semibold text-left text-[11px]"
              >
                Jane Citizen
                <span className="block text-[10px] text-slate-500 font-normal">citizen@civicpulse.org</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('ADMIN')}
                className="p-2 bg-white hover:bg-amber-100 rounded-lg border border-amber-200 text-amber-900 font-semibold text-left text-[11px]"
              >
                Alex Rivera (Admin)
                <span className="block text-[10px] text-slate-500 font-normal">admin@civicpulse.org</span>
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

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 underline">
              Register as Citizen
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
