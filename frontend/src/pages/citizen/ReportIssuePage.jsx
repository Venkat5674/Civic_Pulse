import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PlusCircle,
  MapPin,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { LocationPicker } from '../../components/maps/LocationPicker';
import { DuplicateWarning } from '../../components/issues/DuplicateWarning';

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

export function ReportIssuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, issues, reloadData } = useIssues();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State across steps
  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || 'cat-1',
    title: '',
    description: '',
    severity: 'MEDIUM',
    latitude: 37.774929,
    longitude: -122.419416,
    address: '401 Main St, Downtown Civic Area',
    images: [],
  });

  const [duplicateCandidates, setDuplicateCandidates] = useState([]);
  const [bypassedDuplicates, setBypassedDuplicates] = useState(false);

  const {
    register,
    handleSubmit,
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

  // Step 1 Handler
  const handleStep1Submit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  // Image File Upload Drag-and-Drop handler
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }));
    toast.success(`Attached ${files.length} evidence photo(s)`);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Step 3 -> Step 4 Handler (Duplicate Check)
  const handleCheckDuplicates = () => {
    const candidates = findDuplicateCandidates(formData, issues);
    setDuplicateCandidates(candidates);
    setCurrentStep(4);
  };

  // Final Form Submission
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const created = await issueService.createIssue(formData, user);
      reloadData();
      toast.success('Report submitted successfully! Initial priority score calculated.');
      navigate(`/issues/${created.id}`);
    } catch (err) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
            <PlusCircle className="w-4 h-4" />
            <span>Civic Issue Dispatcher</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Report a Civic Problem</h1>
          <p className="text-xs text-slate-500">
            Follow the 4-step wizard to report infrastructure hazards to Metro City officials.
          </p>
        </div>

        {/* 4-Step Stepper Progress Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          {[
            { step: 1, label: 'Details' },
            { step: 2, label: 'Location' },
            { step: 3, label: 'Evidence' },
            { step: 4, label: 'Review & Submit' },
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition ${
                    currentStep === item.step
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                      : currentStep > item.step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > item.step ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                </div>
                <span
                  className={`text-xs font-bold hidden sm:inline ${
                    currentStep === item.step ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {idx < 3 && <div className="flex-1 h-0.5 bg-slate-200 mx-2 hidden sm:block" />}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: Details */}
        {currentStep === 1 && (
          <form onSubmit={handleSubmit(handleStep1Submit)} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Step 1: Issue Details & Severity
            </h2>

            <Select label="Issue Category" error={errors.categoryId?.message} {...register('categoryId')}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} — {cat.description}
                </option>
              ))}
            </Select>

            <Input
              label="Report Title"
              placeholder="e.g. Deep pothole causing tire damage on 4th Ave"
              error={errors.title?.message}
              {...register('title')}
            />

            <Textarea
              label="Detailed Problem Description"
              placeholder="Describe the problem, hazard level, dimensions, and any safety impact..."
              rows={4}
              error={errors.description?.message}
              {...register('description')}
            />

            <Select label="Estimated Severity Level" error={errors.severity?.message} {...register('severity')}>
              <option value="LOW">LOW — Minor cosmetic or nuisance issue</option>
              <option value="MEDIUM">MEDIUM — Moderate inconvenience or obstruction</option>
              <option value="HIGH">HIGH — Significant hazard affecting traffic or public safety</option>
              <option value="CRITICAL">CRITICAL — Urgent emergency or severe damage risk</option>
            </Select>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Location
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Interactive Location Map Picker */}
        {currentStep === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Step 2: Select Exact Location on Map
            </h2>

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
              height="380px"
            />

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button onClick={() => setCurrentStep(1)} variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Details
              </Button>
              <Button onClick={() => setCurrentStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Evidence Upload
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Photo Evidence Upload */}
        {currentStep === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Step 3: Attach Photo Evidence
            </h2>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50 p-8 rounded-2xl text-center transition cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-900">Drag and drop photo files or click to browse</h4>
                <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP (Max 5MB per file)</p>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={img} alt="Evidence Upload" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-sm"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button onClick={() => setCurrentStep(2)} variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Location
              </Button>
              <Button onClick={handleCheckDuplicates} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Review & Run Duplicate Check
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Review, Duplicate Check & Final Submit */}
        {currentStep === 4 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-card space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Step 4: Review Summary & Submit
            </h2>

            {/* Smart Duplicate Warning Alert */}
            {duplicateCandidates.length > 0 && !bypassedDuplicates && (
              <DuplicateWarning
                candidates={duplicateCandidates}
                onProceedAnyway={() => setBypassedDuplicates(true)}
              />
            )}

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold uppercase tracking-wider text-slate-400">Category</span>
                <span className="font-bold text-brand-700">
                  {categories.find((c) => c.id === formData.categoryId)?.name}
                </span>
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Title</span>
                <p className="text-slate-900 font-semibold text-sm">{formData.title}</p>
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">Description</span>
                <p className="text-slate-700 leading-relaxed">{formData.description}</p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="font-bold uppercase tracking-wider text-slate-400">Severity</span>
                <span className="font-bold text-slate-900">{formData.severity}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-slate-400">Location Pin</span>
                <span className="font-mono text-slate-700">
                  {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button onClick={() => setCurrentStep(3)} variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Evidence
              </Button>
              <Button
                onClick={handleFinalSubmit}
                isLoading={submitting}
                variant="success"
                size="lg"
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
              >
                Confirm & Submit Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
