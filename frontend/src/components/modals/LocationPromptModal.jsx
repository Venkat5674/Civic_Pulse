import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Navigation, Check, X, Compass, Building2, Crosshair } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { toast } from 'sonner';

const CITY_PRESETS = [
  { name: 'Metro City Center', lat: 37.774929, lng: -122.419416, state: 'Default Demo' },
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, state: 'West Coast' },
  { name: 'New York City, NY', lat: 40.7128, lng: -74.006, state: 'East Coast' },
  { name: 'Austin, TX', lat: 30.2672, lng: -97.7431, state: 'Central' },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, state: 'Europe' },
  { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, state: 'Midwest' },
];

export function LocationPromptModal() {
  const { userLocation, updateUserLocation, showLocationPrompt, closeLocationPrompt, user } = useAuth();
  const [detecting, setDetecting] = useState(false);
  const [cityName, setCityName] = useState(userLocation?.cityName || 'Metro City Center');
  const [customLat, setCustomLat] = useState(userLocation?.lat || 37.774929);
  const [customLng, setCustomLng] = useState(userLocation?.lng || -122.419416);

  if (!showLocationPrompt) return null;

  const handleGPSDetect = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCustomLat(lat);
        setCustomLng(lng);
        setCityName('My Current GPS Location');

        updateUserLocation({
          lat,
          lng,
          cityName: 'My Current GPS Location',
          address: `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });

        setDetecting(false);
        toast.success('Current location detected & map default updated!');
        closeLocationPrompt();
      },
      (err) => {
        setDetecting(false);
        console.warn('Geolocation error:', err);
        toast.error('Could not retrieve GPS location. Please choose a city preset.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (preset) => {
    setCustomLat(preset.lat);
    setCustomLng(preset.lng);
    setCityName(preset.name);

    updateUserLocation({
      lat: preset.lat,
      lng: preset.lng,
      cityName: preset.name,
      address: `${preset.name} (${preset.state})`,
    });

    toast.success(`Default location set to ${preset.name}!`);
    closeLocationPrompt();
  };

  const handleSaveCustom = (e) => {
    e.preventDefault();
    updateUserLocation({
      lat: Number(customLat),
      lng: Number(customLng),
      cityName: cityName || 'Custom Area',
      address: `${cityName} (${Number(customLat).toFixed(4)}, ${Number(customLng).toFixed(4)})`,
    });
    toast.success('Custom location saved successfully!');
    closeLocationPrompt();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0f0c1e] rounded-2xl shadow-2xl border border-slate-200/80 dark:border-midnight-700/80 overflow-hidden space-y-0 relative">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-midnight-950 text-white p-6 relative border-b border-slate-800 dark:border-midnight-800">
          <button
            onClick={closeLocationPrompt}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 dark:hover:bg-midnight-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-600 rounded-xl text-white shadow-md">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 bg-brand-900/60 px-2 py-0.5 rounded border border-brand-700/50">
                Location Preference
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1">Set Your Default Map Location</h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 dark:text-slate-400 mt-2 leading-relaxed">
            Welcome {user ? user.name : 'Citizen'}! Select your location to center the live issue map and discover local reports in your area.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Automatic GPS Button */}
          <div className="p-4 bg-brand-50/80 dark:bg-brand-950/40 rounded-xl border border-brand-200/80 dark:border-brand-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <Crosshair className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">Use Browser GPS</span>
                <span className="block text-[11px] text-slate-600 dark:text-slate-300">Detect your exact current latitude & longitude</span>
              </div>
            </div>
            <Button
              onClick={handleGPSDetect}
              isLoading={detecting}
              size="sm"
              className="shrink-0 w-full sm:w-auto"
              leftIcon={<Compass className="w-4 h-4" />}
            >
              Detect My Location
            </Button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              Or Choose a City Preset
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CITY_PRESETS.map((preset) => {
                const isSelected = userLocation?.cityName === preset.name;
                return (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-300 font-bold ring-2 ring-brand-500/20'
                        : 'bg-slate-50 dark:bg-midnight-900/80 hover:bg-slate-100 dark:hover:bg-midnight-800 border-slate-200 dark:border-midnight-700/80 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold truncate">{preset.name.split(',')[0]}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{preset.state}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Coordinates Option */}
          <form onSubmit={handleSaveCustom} className="pt-3 border-t border-slate-100 dark:border-midnight-800 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              Custom Coordinates / City Name
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <Input
                  label="City/Area Name"
                  placeholder="e.g. Downtown"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <Input
                  label="Latitude"
                  type="number"
                  step="any"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <Input
                  label="Longitude"
                  type="number"
                  step="any"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={closeLocationPrompt}>
                Skip for Now
              </Button>

              <Button type="submit" size="sm" leftIcon={<Check className="w-4 h-4" />}>
                Save Location
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
