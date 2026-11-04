import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ShieldAlert,
  Building,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { aiService } from '../../services/aiService';

export function AiPhotoScanner({ onScanComplete, onClear, categories = [] }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, WEBP).');
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setAnalyzing(true);

    try {
      toast.info('Analyzing image with Gemini Vision AI...');
      const response = await aiService.analyzePhoto(file);
      const analysis = response?.analysis || response;

      if (response && response.success && (analysis.title || analysis.categoryName || analysis.categorySlug)) {
        setScannedResult(analysis);

        // Find matching category from list
        let matchedCategoryId = null;
        if (categories.length > 0) {
          const lowerCat = (analysis.categoryName || analysis.categorySlug || '').toLowerCase();
          const found = categories.find((c) => {
            const name = (c.name || '').toLowerCase();
            const slug = (c.slug || '').toLowerCase();
            return lowerCat.includes(name) || name.includes(lowerCat) || lowerCat.includes(slug);
          });
          matchedCategoryId = found ? found.id : categories[0].id;
        }

        toast.success(
          response.isAiPowered
            ? `Analyzed with Gemini Vision (${analysis.model || 'Gemini'})! Detected: ${analysis.categoryName || 'Civic Hazard'}`
            : 'Analyzed with Smart AI Classifier!'
        );

        if (onScanComplete) {
          onScanComplete({
            analysis,
            matchedCategoryId,
            file,
            previewUrl: localUrl,
          });
        }
      } else {
        toast.error(response?.error || response?.message || 'Could not analyze photo. Please fill in details manually.');
      }
    } catch (err) {
      console.error('Scan error:', err);
      toast.error('AI photo analysis failed. You can still fill in the details manually.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setScannedResult(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClear) {
      onClear();
    }
    toast.info('AI scanner reset.');
  };

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'MEDIUM':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200/80 dark:border-violet-900/60 bg-gradient-to-br from-violet-50/70 via-white to-purple-50/50 dark:from-[#18122B]/90 dark:via-[#130E24]/90 dark:to-[#1C1438]/90 p-5 shadow-sm transition-all duration-300">
      {/* Glow decorative effect */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-400/15 dark:bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-500/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-purple-950 dark:text-purple-100 flex items-center gap-1.5">
              Photo Auto-Classification & Severity Analyzer
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                AI Vision
              </span>
            </h3>
            <p className="text-xs text-purple-700/70 dark:text-purple-300/70">
              Upload a photo to automatically categorize the issue, assess severity, and draft the report.
            </p>
          </div>
        </div>

        {scannedResult && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition px-2 py-1 rounded-md border border-purple-200 dark:border-purple-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Upload Dropzone (When not yet analyzed) */}
      {!scannedResult && !analyzing && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group cursor-pointer border-2 border-dashed border-violet-300 dark:border-violet-800/80 hover:border-violet-500 dark:hover:border-violet-500 rounded-xl p-5 text-center transition-all bg-white/60 dark:bg-violet-950/20 hover:bg-violet-50/60 dark:hover:bg-violet-950/40"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center text-violet-600 dark:text-violet-300 group-hover:scale-105 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-purple-950 dark:text-purple-200">
            Click to take a camera photo for instant AI analysis
          </p>
          <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
            Live Camera Capture • Powered by Gemini Vision
          </p>
        </div>
      )}

      {/* Scanning / Loading state */}
      {analyzing && (
        <div className="border border-violet-200 dark:border-violet-800/80 rounded-xl p-6 text-center bg-white/70 dark:bg-violet-950/30 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
              <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />
            </div>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Scanning preview"
                className="w-12 h-12 rounded-lg object-cover border border-violet-300 dark:border-violet-700 shadow-sm"
              />
            )}
          </div>
          <h4 className="text-sm font-bold text-purple-950 dark:text-purple-100">
            Gemini Vision is analyzing the image...
          </h4>
          <p className="text-xs text-purple-600/80 dark:text-purple-400/80 mt-1">
            Detecting civic hazards, calculating severity level, and writing title & description
          </p>
        </div>
      )}

      {/* Scanned Results Display */}
      {scannedResult && !analyzing && (
        <div className="space-y-3 bg-white/80 dark:bg-[#150f29]/90 rounded-xl p-4 border border-violet-200/90 dark:border-violet-900/70 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Analyzed evidence"
                className="w-16 h-16 rounded-lg object-cover border border-violet-200 dark:border-violet-800 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/70 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  {scannedResult.categoryName || 'Detected Hazard'}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getSeverityColor(
                    scannedResult.severity
                  )}`}
                >
                  <ShieldAlert className="w-3 h-3 inline mr-1" />
                  {scannedResult.severity} SEVERITY
                </span>
                {scannedResult.confidence && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Zap className="w-3 h-3 inline mr-1 text-amber-500" />
                    {scannedResult.confidence}% Confidence
                  </span>
                )}
                {scannedResult.recommendedDepartment && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                    <Building className="w-3 h-3 inline mr-1" />
                    {scannedResult.recommendedDepartment}
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-purple-950 dark:text-purple-100 truncate">
                {scannedResult.title}
              </p>
            </div>
          </div>

          {/* Detected tags */}
          {scannedResult.detectedIssues?.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-purple-100 dark:border-purple-900/40 text-xs">
              <span className="text-[11px] font-semibold text-purple-600/80 dark:text-purple-400/80">
                Detected:
              </span>
              {scannedResult.detectedIssues.map((issue, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[11px] bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60"
                >
                  {issue}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 pt-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Form fields auto-filled below! You can review or adjust them at any time.</span>
          </div>
        </div>
      )}
    </div>
  );
}
