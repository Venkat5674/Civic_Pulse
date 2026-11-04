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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '../../components/layout/AppShell';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { LocationPicker } from '../../components/maps/LocationPicker';
import { DuplicateWarning } from '../../components/issues/DuplicateWarning';
import { AiPhotoScanner } from '../../components/ai/AiPhotoScanner';
import { LiveCameraCapture } from '../../components/camera/LiveCameraCapture';

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
  const { user, userLocation } = useAuth();
  const { categories, issues, reloadData } = useIssues();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]); // Array of { file?: File, previewUrl: string, uploadedUrl?: string, publicId?: string }

  // Helper to determine department by category
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

  // Form State across steps
  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || 'cat-1',
    title: '',
    description: '',
    severity: 'MEDIUM',
    latitude: userLocation?.lat || 37.774929,
    longitude: userLocation?.lng || -122.419416,
    address: userLocation?.address || '401 Main St, Downtown Civic Area',
    assignedDepartment: getDepartmentForCategory(categories[0]?.id || 'cat-1'),
    isLiveCapture: true,
    capturedLatitude: userLocation?.lat || 37.774929,
    capturedLongitude: userLocation?.lng || -122.419416,
    capturedAt: new Date().toISOString(),
  });

  const [duplicateCandidates, setDuplicateCandidates] = useState([]);
  const [bypassedDuplicates, setBypassedDuplicates] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
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

  // AI Photo Analysis completion handler
  const handleAiScanComplete = ({ analysis, matchedCategoryId }) => {
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

    // AI scanning may use a gallery image for classification, but it is not evidence.
  };

  // Step 1 Handler
  const handleStep1Submit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  // Live Camera Snapshot handler
  const handlePhotoCaptured = (photoItem) => {
    setImageFiles((prev) => [...prev, photoItem]);
    // Automatically bind the issue location coordinates to the live camera GPS coordinates!
    if (photoItem.latitude && photoItem.longitude) {
      setFormData((prev) => ({
        ...prev,
        latitude: photoItem.latitude,
        longitude: photoItem.longitude,
        capturedLatitude: photoItem.latitude,
        capturedLongitude: photoItem.longitude,
        capturedAt: photoItem.capturedAt,
        isLiveCapture: true,
        address: prev.address || `${photoItem.latitude.toFixed(4)}, ${photoItem.longitude.toFixed(4)}`,
      }));
    }
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 3 -> Step 4 Handler (Duplicate Check)
  const handleCheckDuplicates = () => {
    if (imageFiles.length === 0) {
      toast.error('Live camera photo required! Please capture at least 1 photo using your camera at the live location.');
      return;
    }
    const candidates = findDuplicateCandidates(formData, issues);
    setDuplicateCandidates(candidates);
    setCurrentStep(4);
  };

  // Final Form Submission (Uploads images to POST /api/upload first)
  const handleFinalSubmit = async () => {
    if (imageFiles.length === 0) {
      toast.error('Live camera photo required! Please snap at least 1 photo.');
      return;
    }

    setSubmitting(true);
    try {
      const uploadedImages = [];

      // Upload images only through the live-capture endpoint.
      for (let i = 0; i < imageFiles.length; i++) {
        const item = imageFiles[i];
        if (item.uploadedUrl) {
          uploadedImages.push({
            imageUrl: item.uploadedUrl,
            publicId: item.publicId,
            isLiveCamera: true,
            latitude: item.latitude || formData.latitude,
            longitude: item.longitude || formData.longitude,
            capturedAt: item.capturedAt || formData.capturedAt,
          });
        } else if (item.file) {
          toast.info(`Uploading image ${i + 1} of ${imageFiles.length}...`);
          try {
            if (!item.isLiveCamera || !item.latitude || !item.longitude || !item.capturedAt) {
              throw new Error('Only live camera captures with GPS coordinates can be uploaded.');
            }
            const uploaded = await issueService.uploadImage(item.file, {
              latitude: item.latitude,
              longitude: item.longitude,
              capturedAt: item.capturedAt,
            });
            uploadedImages.push({
              imageUrl: uploaded.imageUrl,
              publicId: uploaded.publicId,
              isLiveCamera: true,
              latitude: item.latitude || formData.latitude,
              longitude: item.longitude || formData.longitude,
              capturedAt: item.capturedAt || formData.capturedAt,
            });
          } catch (uploadErr) {
            throw uploadErr;
          }
        } else if (typeof item === 'string') {
          uploadedImages.push({
            imageUrl: item,
            publicId: `img_${Date.now()}`,
            isLiveCamera: true,
            latitude: formData.latitude,
            longitude: formData.longitude,
            capturedAt: formData.capturedAt,
          });
        }
      }

      // Step 2: Auto-assign department based on category
      const assignedDepartment = getDepartmentForCategory(formData.categoryId);

      // Step 3: Submit final issue report
      const payload = {
        ...formData,
        assignedDepartment,
        isLiveCapture: true,
        capturedLatitude: formData.capturedLatitude || formData.latitude,
        capturedLongitude: formData.capturedLongitude || formData.longitude,
        capturedAt: formData.capturedAt || new Date().toISOString(),
        images: uploadedImages,
      };

      const created = await issueService.createIssue(payload, user);
      reloadData();
      toast.success(`Report submitted successfully! Dispatched to ${assignedDepartment}.`);
      navigate(`/issues/${created.id}`);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-xs font-bold">
            <PlusCircle className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Civic Issue Dispatcher</span>
          </div>
          <h1 className="text-3xl font-extrabold text-purple-950 dark:text-white">Report a Civic Problem</h1>
          <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
            Follow the 4-step wizard to report infrastructure hazards to Metro City officials.
          </p>
        </div>

        {/* 4-Step Stepper Progress Bar */}
        <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-4 rounded-xl border border-purple-100 dark:border-purple-900/40 shadow-sm flex items-center justify-between transition-colors">
          {[
            { step: 1, label: 'Details' },
            { step: 2, label: 'Location' },
            { step: 3, label: 'Evidence' },
            { step: 4, label: 'Review & Submit' },
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition ${currentStep === item.step
                    ? 'bg-violet-600 text-white ring-4 ring-violet-200 dark:ring-violet-900'
                    : currentStep > item.step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-100 dark:bg-purple-950/60 text-purple-400 dark:text-purple-500'
                    }`}
                >
                  {currentStep > item.step ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                </div>
                <span
                  className={`text-xs font-bold hidden sm:inline ${currentStep === item.step ? 'text-purple-950 dark:text-white' : 'text-purple-400 dark:text-purple-500'
                    }`}
                >
                  {item.label}
                </span>
              </div>
              {idx < 3 && <div className="flex-1 h-0.5 bg-purple-200 dark:bg-purple-900/40 mx-2 hidden sm:block" />}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: Details */}
        {currentStep === 1 && (
          <form onSubmit={handleSubmit(handleStep1Submit)} className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-6 transition-colors">
            <h2 className="text-lg font-bold text-purple-950 dark:text-white pb-3 border-b border-purple-100 dark:border-purple-900/30">
              Step 1: Issue Details & Severity
            </h2>

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

            <div className="flex justify-end pt-4 border-t border-purple-100 dark:border-purple-900/30">
              <Button type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Location
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Interactive Location Map Picker */}
        {currentStep === 2 && (
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-6 transition-colors">
            <h2 className="text-lg font-bold text-purple-950 dark:text-white pb-3 border-b border-purple-100 dark:border-purple-900/30">
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

            <div className="flex justify-between pt-4 border-t border-purple-100 dark:border-purple-900/30">
              <Button onClick={() => setCurrentStep(1)} variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Details
              </Button>
              <Button onClick={() => setCurrentStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Proceed to Evidence Upload
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Live Camera Evidence Capture */}
        {currentStep === 3 && (
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-6 transition-colors">
            <div>
              <h2 className="text-lg font-bold text-purple-950 dark:text-white pb-1">
                Step 3: Capture On-Site Live Camera Evidence
              </h2>
              <p className="text-xs text-purple-700/80 dark:text-purple-300/80 pb-3 border-b border-purple-100 dark:border-purple-900/30">
                Snap photos directly through your camera at the live location. Only live camera captures are accepted.
              </p>
            </div>

            <LiveCameraCapture
              onPhotoCaptured={handlePhotoCaptured}
              capturedImages={imageFiles}
              onRemoveImage={removeImage}
              maxPhotos={4}
            />

            <div className="flex justify-between pt-4 border-t border-purple-100 dark:border-purple-900/30">
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
          <div className="bg-white/90 dark:bg-[#120d25]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-purple-100 dark:border-purple-900/40 shadow-card space-y-6 transition-colors">
            <h2 className="text-lg font-bold text-purple-950 dark:text-white pb-3 border-b border-purple-100 dark:border-purple-900/30">
              Step 4: Review Summary & Submit
            </h2>

            {/* Smart Duplicate Warning Alert */}
            {duplicateCandidates.length > 0 && !bypassedDuplicates && (
              <DuplicateWarning
                candidates={duplicateCandidates}
                onProceedAnyway={() => setBypassedDuplicates(true)}
              />
            )}

            <div className="bg-purple-50/60 dark:bg-purple-950/40 p-5 rounded-xl border border-purple-200/80 dark:border-purple-800/50 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-purple-200/60 dark:border-purple-800/40">
                <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Category</span>
                <span className="font-bold text-violet-700 dark:text-violet-300">
                  {categories.find((c) => c.id === formData.categoryId)?.name}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-purple-200/60 dark:border-purple-800/40">
                <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Concerned Authority</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  🏛️ {getDepartmentForCategory(formData.categoryId)}
                </span>
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">Title</span>
                <p className="text-purple-950 dark:text-white font-semibold text-sm">{formData.title}</p>
              </div>

              <div>
                <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">Description</span>
                <p className="text-purple-800/90 dark:text-purple-200 leading-relaxed">{formData.description}</p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-purple-200/60 dark:border-purple-800/40">
                <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Severity</span>
                <span className="font-bold text-purple-950 dark:text-white">{formData.severity}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Verified Location GPS</span>
                <span className="font-mono text-purple-900 dark:text-purple-200">
                  {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Camera Verification</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Live Camera & Location Verified</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Attached Photos</span>
                <span className="font-semibold text-purple-900 dark:text-purple-200">
                  {imageFiles.length} live photo(s) captured
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-purple-100 dark:border-purple-900/30">
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
