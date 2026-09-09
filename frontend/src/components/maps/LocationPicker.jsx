import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '../ui/Button';

// Location pin icon
const locationPinIcon = L.divIcon({
  className: 'custom-location-pin',
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e11d48" width="36" height="36" stroke="#ffffff" stroke-width="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function LocationClickTracker({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  selectedLat = 37.774929,
  selectedLng = -122.419416,
  onLocationChange,
  height = '350px',
}) {
  const [position, setPosition] = useState({ lat: selectedLat, lng: selectedLng });

  const handleSelect = (lat, lng) => {
    setPosition({ lat, lng });
    if (onLocationChange) {
      onLocationChange({
        latitude: lat,
        longitude: lng,
        address: `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)} (Selected Pin)`,
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleSelect(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Fallback if denied
          handleSelect(37.774929, -122.419416);
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <MapPin className="w-4 h-4 text-rose-600" />
          <span>Click anywhere on the map to place the issue pin</span>
        </div>
        <Button
          onClick={handleUseCurrentLocation}
          variant="outline"
          size="sm"
          leftIcon={<Navigation className="w-3.5 h-3.5" />}
        >
          Use Current Location
        </Button>
      </div>

      <div style={{ height }} className="w-full relative rounded-xl overflow-hidden border border-slate-300 shadow-sm">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationClickTracker onSelectLocation={handleSelect} />
          <Marker position={[position.lat, position.lng]} icon={locationPinIcon} />
        </MapContainer>
      </div>

      <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700">
        <div>
          <span className="font-semibold text-slate-900">Selected Coordinates: </span>
          <span className="font-mono text-brand-700 font-medium">
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </span>
        </div>
        <span className="text-slate-500 italic">Click map to adjust pin position</span>
      </div>
    </div>
  );
}
