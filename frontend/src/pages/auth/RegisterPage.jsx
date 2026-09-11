import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerAuth(data.name, data.email, data.password);
      toast.success('Registration successful! Welcome to CivicPulse.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
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
            <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white">Create Citizen Account</h1>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80">Join CivicPulse to report and track municipal infrastructure issues</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

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

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" isLoading={loading} className="w-full" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-purple-700/80 dark:text-purple-300/80 pt-2 border-t border-purple-100 dark:border-purple-900/30">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
