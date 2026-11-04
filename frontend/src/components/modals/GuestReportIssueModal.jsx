import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  PlusCircle,
  MapPin,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { LocationPicker } from '../maps/LocationPicker';
import { DuplicateWarning } from '../issues/DuplicateWarning';
import { AiPhotoScanner } from '../ai/AiPhotoScanner';
import { LiveCameraCapture } from '../camera/LiveCameraCapture';

import { useAuth } from '../../context/AuthContext';
import { useIssues } from '../../context/IssueContext';
import { issueService } from '../../services/issueService';
import { findDuplicateCandidates } from '../../services/duplicateDetectionService';

const step1Schema = z.object({
  categoryId: z.string().min(1, 'Please select an issue category'),
  title: z.string().min(8, 'Title must be at least 8 characters long'),
  description: z.string().min(20, 'Please provide a detailed description (at least 20 chars)'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
});

export function GuestReportIssueModal({ isOpen, onClose, onSuccess }) {
  const { user, userLocation } = useAuth();
  const { categories, issues, reloadData } = useIssues();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || 'cat-1',
    title: '',
    description: '',
    severity: 'MEDIUM',
    latitude: userLocation?.lat || 37.774929,
    longitude: userLocation?.lng || -122.419416,
    address: userLocation?.address || 'Metro City Center',
    images: [],
  });

  const [duplicateCandidates, setDuplicateCandidates] = useState([]);
  const [bypassedDuplicates, setBypassedDuplicates] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      categoryId: formData.categoryId,
      title: formData.title,
      description: formData.description,
      severity: formData.severity,
    },
  });

  const handleAiScanComplete = ({ analysis, matchedCategoryId, previewUrl }) => {
    if (analysis.title) {
      setValue('title', analysis.title, { shouldValidate: true });
      setFormData((prev) => ({ ...prev, title: analysis.title }));
    }
    if (analysis.description) {
      setValue('description', analysis.description, { shouldValidate: true });
      setFormData((prev) => ({ ...prev, description: analysis.description }));
    }
    if (analysis.severity) {
      setValue('severity', analysis.severity, { shouldValidate: true });
      setFormData((prev) => ({ ...prev, severity: analysis.severity }));
    }
    if (matchedCategoryId) {
      setValue('categoryId', matchedCategoryId, { shouldValidate: true });
      setFormData((prev) => ({ ...prev, categoryId: matchedCategoryId }));
    }
    if (previewUrl) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.includes(previewUrl) ? prev.images : [previewUrl, ...prev.images],
      }));
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentStep(1);
    reset();
    onClose();
  };

  const handleStep1Submit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const getDepartmentForCategory = (catId) => {
    const cat = categories.find((c) => c.id === catId || c.slug === catId);
    if (cat?.department) return cat.department;
    const name = (cat?.name || '').toLowerCase();
    if (name.includes('road') || name.includes('pothole') || name.includes('traffic') || name.includes('signal') || name.includes('signage')) {
      return 'Road Safety Department';
    }
    if (name.includes('light') || name.includes('electric') || name.includes('lamp') || name.includes('power')) {
      return 'Electrical Department';
    }
    if (name.includes('water') || name.includes('pipe') || name.includes('drain') || name.includes('sewage') || name.includes('leak')) {
      return 'Water Department';
    }
    return 'Municipal Department';
  };

  const handlePhotoCaptured = (photoItem) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, photoItem.previewUrl],
      latitude: photoItem.latitude || prev.latitude,
      longitude: photoItem.longitude || prev.longitude,
      capturedLatitude: photoItem.latitude,
      capturedLongitude: photoItem.longitude,
      capturedAt: photoItem.capturedAt,
      isLiveCapture: true,
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleCheckDuplicates = () => {
    if (formData.images.length === 0) {
      toast.error('Live camera photo required! Please snap at least 1 photo at the scene.');
      return;
    }
    const candidates = findDuplicateCandidates(formData, issues);
    setDuplicateCandidates(candidates);
    setCurrentStep(4);
  };

  const handleFinalSubmit = async () => {
    if (formData.images.length === 0) {
      toast.error('Live camera photo required! Please snap at least 1 photo.');
      return;
    }

    setSubmitting(true);
    try {
      const guestUser = user || {
        id: `guest-${Date.now()}`,
        name: 'Guest Contributor',
        role: 'GUEST',
        avatarUrl: 'https://ui-avatars.com/api/?name=Guest+Contributor&background=7c3aed&color=fff&bold=true',
      };

      const assignedDepartment = getDepartmentForCategory(formData.categoryId);
      const payload = {
        ...formData,
        assignedDepartment,
        isLiveCapture: true,
        capturedLatitude: formData.capturedLatitude || formData.latitude,
        capturedLongitude: formData.capturedLongitude || formData.longitude,
        capturedAt: formData.capturedAt || new Date().toISOString(),
      };

      const created = await issueService.createIssue(payload, guestUser);
      reloadData();
      toast.success(`Issue raised successfully as Guest! Dispatched to ${assignedDepartment}.`);
      if (onSuccess) onSuccess(created);
      handleClose();
    } catch (err) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#120d25] rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-900/50 overflow-hidden my-8">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-purple-100 dark:border-purple-900/40 bg-gradient-to-r from-purple-50 via-white to-purple-50/50 dark:from-[#181130] dark:via-[#120d25] dark:to-[#181130]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-purple-950 dark:text-white flex items-center gap-2">
                Raise an Issue as Guest
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                  Guest Mode
                </span>
              </h2>
              <p className="text-xs text-purple-700/70 dark:text-purple-300/70">
                Report local hazards & infrastructure problems directly to your city
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-purple-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="bg-purple-50/70 dark:bg-purple-950/40 px-6 py-3 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
          {[
            { step: 1, label: 'Details' },
            { step: 2, label: 'Location' },
            { step: 3, label: 'Evidence' },
            { step: 4, label: 'Review' },
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] transition ${currentStep === item.step
                    ? 'bg-violet-600 text-white ring-2 ring-violet-300 dark:ring-violet-800'
                    : currentStep > item.step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-200 dark:bg-purple-900/60 text-purple-500'
                    }`}
                >
                  {currentStep > item.step ? <CheckCircle2 className="w-3.5 h-3.5" /> : item.step}
                </div>
                <span
                  className={`text-xs font-bold ${currentStep === item.step ? 'text-purple-950 dark:text-white' : 'text-purple-400 dark:text-purple-500'
                    }`}
                >
                  {item.label}
                </span>
              </div>
              {idx < 3 && <div className="flex-1 h-0.5 bg-purple-200 dark:bg-purple-900/40 mx-2" />}
            </React.Fragment>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmit(handleStep1Submit)} className="space-y-4">
              {/* AI Photo Auto-Classification & Severity Analyzer */}
              <AiPhotoScanner
                categories={categories}
                onScanComplete={handleAiScanComplete}
              />

              <Select label="Issue Category" error={errors.categoryId?.message} {...register('categoryId')}>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} — {cat.description}
                  </option>
                ))}
              </Select>

              <Input
                label="Report Title"
                placeholder="e.g. Broken street lamp near 5th cross street"
                error={errors.title?.message}
                {...register('title')}
              />

              <Textarea
                label="Problem Description"
                placeholder="Describe the issue, dimensions, hazard level, and exact location markers..."
                rows={3}
                error={errors.description?.message}
                {...register('description')}
              />

              <Select label="Severity Level" error={errors.severity?.message} {...register('severity')}>
                <option value="LOW">LOW — Minor nuisance</option>
                <option value="MEDIUM">MEDIUM — Moderate inconvenience</option>
                <option value="HIGH">HIGH — Safety hazard</option>
                <option value="CRITICAL">CRITICAL — Emergency risk</option>
              </Select>

              <div className="flex justify-end pt-4 border-t border-purple-100 dark:border-purple-900/30">
                <Button type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Next: Pick Location
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
                Click on the map or drag the pin to set the issue location:
              </p>

              <LocationPicker
                selectedLat={formData.latitude}
                selectedLng={formData.longitude}
                onLocationChange={(loc) => {
                  setFormData((prev) => ({
                    ...prev,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    address: loc.address,
                  }));
                }}
                height="300px"
              />

              <div className="flex justify-between pt-4 border-t border-purple-100 dark:border-purple-900/30">
                <Button onClick={() => setCurrentStep(1)} variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Next: Add Evidence
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <LiveCameraCapture
                onPhotoCaptured={handlePhotoCaptured}
                capturedImages={formData.images.map((img) =>
                  typeof img === 'string' ? { previewUrl: img } : img
                )}
                onRemoveImage={removeImage}
                maxPhotos={3}
              />

              <div className="flex justify-between pt-4 border-t border-purple-100 dark:border-purple-900/30">
                <Button onClick={() => setCurrentStep(2)} variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button onClick={handleCheckDuplicates} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Review Report
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {duplicateCandidates.length > 0 && !bypassedDuplicates && (
                <DuplicateWarning
                  candidates={duplicateCandidates}
                  onProceedAnyway={() => setBypassedDuplicates(true)}
                />
              )}

              <div className="bg-purple-50/60 dark:bg-purple-950/40 p-4 rounded-xl border border-purple-200/80 dark:border-purple-800/50 space-y-2 text-xs">
                <div className="flex justify-between pb-1.5 border-b border-purple-200/60 dark:border-purple-800/40">
                  <span className="font-bold uppercase text-purple-600 dark:text-purple-400">Category</span>
                  <span className="font-bold text-violet-700 dark:text-violet-300">
                    {categories.find((c) => c.id === formData.categoryId)?.name}
                  </span>
                </div>
                <div>
                  <span className="font-bold uppercase text-purple-600 dark:text-purple-400 block mb-0.5">Title</span>
                  <p className="text-purple-950 dark:text-white font-bold">{formData.title}</p>
                </div>
                <div>
                  <span className="font-bold uppercase text-purple-600 dark:text-purple-400 block mb-0.5">Description</span>
                  <p className="text-purple-800/90 dark:text-purple-200">{formData.description}</p>
                </div>
                <div className="flex justify-between pt-1 border-t border-purple-200/60 dark:border-purple-800/40">
                  <span className="font-bold uppercase text-purple-600 dark:text-purple-400">Severity</span>
                  <span className="font-bold text-purple-950 dark:text-white">{formData.severity}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-purple-100 dark:border-purple-900/30">
                <Button onClick={() => setCurrentStep(3)} variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  onClick={handleFinalSubmit}
                  isLoading={submitting}
                  variant="success"
                  size="md"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Submit Issue as Guest
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
