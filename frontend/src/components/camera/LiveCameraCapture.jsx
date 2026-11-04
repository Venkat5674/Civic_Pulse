import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Video,
  VideoOff,
  ShieldCheck,
  Clock,
  Sparkles,
  X,
  Radio,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';

export function LiveCameraCapture({
  onPhotoCaptured,
  capturedImages = [],
  onRemoveImage,
  maxPhotos = 4,
}) {
  const [streamActive, setStreamActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [capturing, setCapturing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentGps, setCurrentGps] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  // Acquire live geolocation on mount or refresh
  const fetchLiveGps = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 10),
          timestamp: new Date(pos.timestamp || Date.now()),
        };
        setCurrentGps(coords);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation lookup issue:', err.message);
        setCurrentGps(null);
        toast.error('Live location permission is required to capture evidence.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    fetchLiveGps();
  }, []);

  // Start live camera stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err) {
      console.warn('WebRTC camera stream failed:', err);
      setCameraError(
        'Direct browser camera stream could not be started (permission denied or no camera device found). You can use the Native Device Camera button below.'
      );
      setStreamActive(false);
    }
  };

  // Stop live camera stream
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
  };

  // Switch between front & back camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (streamActive) {
      stopCamera();
      setTimeout(() => startCamera(), 200);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Process live camera frame snapshot
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (!currentGps) {
      toast.error('Wait for a live GPS location before taking a photo.');
      return;
    }
    setCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Draw current video frame
      ctx.drawImage(video, 0, 0, width, height);

      // Watermark live camera stamp with GPS and timestamp for authentic verification
      const now = new Date();
      const latStr = currentGps ? currentGps.latitude.toFixed(6) : 'LIVE-LOC';
      const lngStr = currentGps ? currentGps.longitude.toFixed(6) : 'LIVE-LOC';
      const timeStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

      // Semi-transparent bottom banner
      ctx.fillStyle = 'rgba(15, 10, 35, 0.75)';
      ctx.fillRect(0, height - 70, width, 70);

      // Verification text
      ctx.fillStyle = '#10b981'; // emerald green
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('✓ LIVE CAMERA CAPTURE • CIVICPULSE VERIFIED', 20, height - 42);

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.fillText(`GPS: ${latStr}, ${lngStr} (±${currentGps?.accuracy || 10}m) | ${timeStr}`, 20, height - 16);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error('Failed to capture snapshot from camera.');
            setCapturing(false);
            return;
          }

          const file = new File([blob], `live_camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(blob);

          onPhotoCaptured({
            file,
            previewUrl,
            isLiveCamera: true,
            latitude: currentGps.latitude,
            longitude: currentGps.longitude,
            accuracy: currentGps.accuracy,
            capturedAt: now.toISOString(),
          });

          toast.success('Live photo captured with verified GPS coordinates!');
          setCapturing(false);
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Snapshot capture error:', err);
      toast.error('Could not take snapshot. Please try again.');
      setCapturing(false);
    }
  };

  // Handle native camera capture input (`accept="image/*" capture="environment"`)
  const handleNativeCameraCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!currentGps) {
      toast.error('Live location permission is required before using the device camera.');
      if (nativeCameraInputRef.current) nativeCameraInputRef.current.value = '';
      return;
    }

    const now = new Date();
    const previewUrl = URL.createObjectURL(file);

    onPhotoCaptured({
      file,
      previewUrl,
      isLiveCamera: true,
      latitude: currentGps.latitude,
      longitude: currentGps.longitude,
      accuracy: currentGps.accuracy,
      capturedAt: now.toISOString(),
    });

    toast.success('Live camera photo attached with verified coordinates!');
    if (nativeCameraInputRef.current) {
      nativeCameraInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Notice Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-500/30 text-xs text-purple-900 dark:text-purple-200 flex items-start justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-sm text-purple-950 dark:text-white block">
              Live Camera & Location Verification Enforced
            </span>
            <p className="mt-0.5 leading-relaxed text-purple-800/80 dark:text-purple-300/80">
              To prevent fraudulent or out-of-date reports, evidence photos must be taken{' '}
              <strong>directly using your camera in the live location</strong>. Gallery uploads are disabled.
            </p>
          </div>
        </div>

        {/* Live GPS badge */}
        <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono font-bold">
          <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
          <span>
            {locating
              ? 'Locating...'
              : currentGps
              ? `${currentGps.latitude.toFixed(4)}, ${currentGps.longitude.toFixed(4)}`
              : 'GPS Ready'}
          </span>
        </div>
      </div>

      {/* Live Viewfinder Box */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-violet-500/40 shadow-xl min-h-[280px] flex flex-col items-center justify-center text-white">
        {/* Video feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-[320px] sm:h-[380px] object-cover transition-opacity duration-300 ${
            streamActive ? 'opacity-100 block' : 'hidden'
          }`}
        />

        {/* Hidden Canvas for taking snapshot */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Fallback View when camera stream is not active */}
        {!streamActive && (
          <div className="p-8 text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400">
              <Camera className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Live Camera Viewfinder</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click below to open your camera in real time, or launch your device's native camera shutter.
              </p>
            </div>

            {cameraError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs text-left flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                onClick={startCamera}
                variant="primary"
                leftIcon={<Video className="w-4 h-4" />}
                className="bg-violet-600 hover:bg-violet-500 text-white"
              >
                Open Live Web Camera
              </Button>

              {/* Native device camera input (Opens camera directly on phones and PCs) */}
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 cursor-pointer shadow-sm transition">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Device Shutter Camera</span>
                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleNativeCameraCapture}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Live HUD Overlay when stream is running */}
        {streamActive && (
          <>
            {/* Top HUD */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono pointer-events-none">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                LIVE CAMERA ACTIVE
              </span>

              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700">
                <MapPin className="w-3 h-3 text-rose-400" />
                {currentGps ? `${currentGps.latitude.toFixed(5)}, ${currentGps.longitude.toFixed(5)}` : 'Detecting GPS...'}
              </span>
            </div>

            {/* Viewfinder crosshairs */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 sm:w-64 sm:h-64 border-2 border-dashed border-violet-400/50 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-violet-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-violet-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-violet-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-violet-400" />
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 px-4">
              <button
                type="button"
                onClick={toggleFacingMode}
                className="p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700 shadow-md backdrop-blur-md transition"
                title="Flip Camera (Front/Back)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {/* Shutter Button */}
              <button
                type="button"
                disabled={capturing || capturedImages.length >= maxPhotos}
                onClick={takeSnapshot}
                className="w-16 h-16 rounded-full bg-white text-slate-950 p-1 border-4 border-violet-500 shadow-2xl hover:scale-105 active:scale-95 transition flex items-center justify-center group disabled:opacity-50"
                title="Snap Live Photo"
              >
                <div className="w-full h-full rounded-full bg-violet-600 group-hover:bg-violet-700 flex items-center justify-center transition">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="p-3 rounded-full bg-slate-900/80 text-rose-400 hover:bg-slate-800 border border-slate-700 shadow-md backdrop-blur-md transition"
                title="Turn Off Camera"
              >
                <VideoOff className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Captured Live Photos List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              Verified Live Camera Photos ({capturedImages.length} / {maxPhotos})
            </span>
          </span>
          {capturedImages.length === 0 && (
            <span className="text-rose-500 text-[11px] font-semibold animate-pulse">
              * At least 1 live camera photo is required
            </span>
          )}
        </div>

        {capturedImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {capturedImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative h-36 rounded-xl overflow-hidden bg-slate-950 border border-purple-200 dark:border-purple-800 shadow-sm"
              >
                <img
                  src={img.previewUrl || img.imageUrl}
                  alt={`Live Snap ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                />

                {/* Live verification ribbon */}
                <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm backdrop-blur-xs flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Live Verified</span>
                </div>

                {/* Remove button */}
                {onRemoveImage && (
                  <button
                    type="button"
                    onClick={() => onRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-md"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Coordinates bottom badge */}
                <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 backdrop-blur-xs text-[10px] font-mono text-purple-200 px-2 py-1 truncate">
                  📍 {img.latitude ? `${img.latitude.toFixed(4)}, ${img.longitude.toFixed(4)}` : 'Live GPS Stamped'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-purple-300 dark:border-purple-800 text-center text-xs text-purple-700/80 dark:text-purple-300/80 bg-purple-50/40 dark:bg-purple-950/30">
            No live camera photo taken yet. Open the camera or tap the shutter above to snap your evidence on-site.
          </div>
        )}
      </div>
    </div>
  );
}
