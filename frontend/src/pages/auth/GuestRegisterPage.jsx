import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, User, MapPin, Sparkles, ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const guestRegisterSchema = z.object({
  guestName: z.string().min(2, 'Guest name must be at least 2 characters'),
  neighborhood: z.string().min(3, 'Neighborhood/City location is required'),
});

export function GuestRegisterPage() {
  const navigate = useNavigate();
  const { switchDemoRole, updateUserLocation, userLocation } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(guestRegisterSchema),
    defaultValues: {
      guestName: '',
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
      toast.success(`Guest profile created for ${data.guestName}! Welcome to CivicPulse.`);
      navigate('/guest-dashboard');
    } catch (err) {
      toast.error('Failed to create guest profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md rounded-3xl border border-purple-100 dark:border-purple-900/40 shadow-2xl p-8 space-y-6 transition-colors">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-extrabold">
              <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Guest Registration</span>
            </div>
            <h1 className="text-2xl font-black text-purple-950 dark:text-white">Create Guest Profile</h1>
            <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
              Register a quick guest profile to track neighborhood problems and submit local reports
            </p>
          </div>

          {/* Guest Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Guest Display Name"
              placeholder="e.g. Guest Observer"
              leftIcon={<User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              error={errors.guestName?.message}
              {...register('guestName')}
            />

            <Input
              label="Primary Neighborhood / Location"
              placeholder="e.g. Metro City Center, 4th Ave"
              leftIcon={<MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              error={errors.neighborhood?.message}
              {...register('neighborhood')}
            />

            {/* Feature Highlights */}
            <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-xl border border-purple-100 dark:border-purple-900/40 space-y-1.5 text-xs text-purple-800/90 dark:text-purple-200">
              <div className="font-extrabold text-purple-950 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Guest Profile Privileges:</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-purple-700/80 dark:text-purple-300/80">
                <li>Instant access to local distance-based problem feed</li>
                <li>Vote Accept (Green) or Reject (Red) on public issues</li>
                <li>Raise new civic reports complete with map pin & photos</li>
                <li>View interactive Guest Dashboard metrics</li>
              </ul>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-md shadow-emerald-500/20"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Register & Go to Dashboard
            </Button>
          </form>

          {/* Navigation Links */}
          <div className="space-y-2 text-center text-xs text-purple-700/80 dark:text-purple-300/80 pt-3 border-t border-purple-100 dark:border-purple-900/30">
            <div>
              Already have a guest session?{' '}
              <Link to="/guest-login" className="font-extrabold text-violet-600 dark:text-violet-400 hover:underline">
                Guest Sign In &rarr;
              </Link>
            </div>
            <div>
              Want to create a full Citizen Account?{' '}
              <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Register Citizen
              </Link>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
