import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
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
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      toast.success('Logged in successfully!');
      if (res?.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
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
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white">Welcome Back</h1>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80">Sign in to your CivicPulse account to manage reports</p>
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

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">Password</span>
                <Link to="/forgot-password" className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button type="submit" isLoading={loading} className="w-full" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </Button>
          </form>

          <div className="space-y-1.5 text-center text-xs text-purple-700/80 dark:text-purple-300/80 pt-2 border-t border-purple-100 dark:border-purple-900/30">
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 underline">
                Register as Citizen
              </Link>
            </div>
            <div>
              Visiting as a Guest?{' '}
              <Link to="/guest-login" className="font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline">
                Guest Sign In &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
