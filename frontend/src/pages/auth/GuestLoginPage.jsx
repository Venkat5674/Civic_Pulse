import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Eye, User, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const guestLoginSchema = z.object({
  guestName: z.string().min(2, 'Guest name must be at least 2 characters'),
  neighborhood: z.string().min(3, 'Neighborhood/City must be at least 3 characters'),
});

export function GuestLoginPage() {
  const navigate = useNavigate();
  const { switchDemoRole, updateUserLocation, userLocation } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(guestLoginSchema),
    defaultValues: {
      guestName: 'Guest Visitor',
      neighborhood: userLocation?.cityName || 'Metro City Center',
    },
  });

  const onSubmit = (data) => {
    setLoading(true);
    try {
      switchDemoRole('GUEST');
      if (data.neighborhood) {
        updateUserLocation({ cityName: data.neighborhood });
      }
      toast.success(`Welcome ${data.guestName}! Signed in as Guest Visitor.`);
      navigate('/guest-dashboard');
    } catch (err) {
      toast.error('Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantGuest = () => {
    switchDemoRole('GUEST');
    toast.success('Signed in with Instant Guest Access!');
    navigate('/guest-dashboard');
  };

  return (
    <AppShell showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-2xl p-8 space-y-6 transition-colors">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-md shadow-violet-500/20">
              <Eye className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-[11px] font-extrabold">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>Guest Portal Login</span>
            </div>
            <h1 className="text-2xl font-black text-purple-950 dark:text-white">Guest Sign In</h1>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
              Explore nearby municipal problems, express Accept/Reject feedback, and raise issues
            </p>
          </div>

          {/* Instant Guest CTA */}
          <div className="p-4 bg-gradient-to-br from-violet-50 via-indigo-50/50 to-purple-50 dark:from-[#181130] dark:to-[#120d25] rounded-2xl border border-violet-200/80 dark:border-violet-800/60 space-y-2 text-center">
            <p className="text-xs font-extrabold text-violet-950 dark:text-violet-200">
              Want instant access without entering details?
            </p>
            <Button
              type="button"
              onClick={handleInstantGuest}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-extrabold shadow-md shadow-violet-500/20"
              size="md"
              leftIcon={<Eye className="w-4 h-4" />}
            >
              One-Click Instant Guest Sign In
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-purple-200 dark:border-purple-800/50 w-full" />
            <span className="bg-white dark:bg-[#120d25] px-3 text-[11px] font-bold text-purple-400 dark:text-purple-500 uppercase tracking-wider shrink-0">
              Or Customize Guest Profile
            </span>
          </div>

          {/* Guest Custom Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Guest Display Name"
              placeholder="e.g. Guest Alex"
              leftIcon={<User className="w-4 h-4 text-violet-500" />}
              error={errors.guestName?.message}
              {...register('guestName')}
            />

            <Input
              label="Active Neighborhood / City"
              placeholder="e.g. Metro City Center"
              leftIcon={<MapPin className="w-4 h-4 text-violet-500" />}
              error={errors.neighborhood?.message}
              {...register('neighborhood')}
            />

            <Button type="submit" isLoading={loading} className="w-full" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Enter Guest Dashboard
            </Button>
          </form>

          {/* Navigation Links */}
          <div className="space-y-2 text-center text-xs text-purple-700/80 dark:text-purple-300/80 pt-3 border-t border-purple-100 dark:border-purple-900/30">
            <div>
              New guest visitor?{' '}
              <Link to="/guest-register" className="font-extrabold text-violet-600 dark:text-violet-400 hover:underline">
                Create Guest Profile &rarr;
              </Link>
            </div>
            <div>
              Are you a registered Citizen?{' '}
              <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Citizen Sign In
              </Link>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
