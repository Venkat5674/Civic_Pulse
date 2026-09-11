import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StatusBadge } from '../issues/StatusBadge';
import { PriorityIndicator } from '../issues/PriorityIndicator';
import { Link } from 'react-router-dom';
import { Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Helper component to smoothly recenter Leaflet map when center prop changes
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// User location marker pin generator
const userLocationIcon = L.divIcon({
  className: 'custom-user-location-pin',
  html: `
    <div style="position: relative; width: 32px; height: 32px;">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(99, 102, 241, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; top: 4px; left: 4px; width: 24px; height: 24px; border-radius: 50%; background: #4f46e5; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); flex; align-items: center; justify-content: center;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff; margin: 5px auto;"></div>
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Custom Issue Marker Icons generator based on status & severity
function createCustomMarkerIcon(status = 'OPEN', priorityScore = 50) {
  let color = '#2563eb'; // Blue for open
  if (status === 'UNDER_REVIEW') color = '#d97706'; // Amber
  if (status === 'IN_PROGRESS') color = '#7c3aed'; // Purple
  if (status === 'RESOLVED') color = '#059669'; // Green
  if (status === 'REJECTED') color = '#e11d48'; // Red

  const svgMarker = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="34" height="34" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-map-marker',
    html: svgMarker,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

export function IssueMap({
  issues = [],
  center,
  zoom = 13,
  height = '500px',
  onMarkerSelect,
  showUserMarker = true,
}) {
  const { userLocation, openLocationPrompt } = useAuth();
  const activeCenter = center || [userLocation?.lat || 37.774929, userLocation?.lng || -122.419416];

  return (
    <div style={{ height }} className="w-full relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-midnight-700/80 shadow-md dark:shadow-2xl">
      <MapContainer center={activeCenter} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <MapRecenter center={activeCenter} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Default Location Marker */}
        {showUserMarker && userLocation?.lat && userLocation?.lng && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-2 space-y-1 font-sans text-xs">
                <div className="flex items-center gap-1 font-bold text-brand-700">
                  <Navigation className="w-3.5 h-3.5 text-brand-600" />
                  <span>Your Default Location</span>
                </div>
                <p className="text-[11px] text-slate-600 font-semibold">{userLocation.cityName}</p>
                <button
                  onClick={openLocationPrompt}
                  className="text-[10px] text-brand-600 font-bold hover:underline"
                >
                  Change Location &rarr;
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Civic Issue Markers */}
        {issues.map((issue) => {
          if (!issue.latitude || !issue.longitude) return null;

          const icon = createCustomMarkerIcon(issue.status, issue.priorityScore);

          return (
            <Marker
              key={issue.id}
              position={[issue.latitude, issue.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onMarkerSelect) onMarkerSelect(issue);
                },
              }}
            >
              <Popup>
                <div className="p-3 space-y-2 font-sans">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                      {issue.categoryName}
                    </span>
                    <PriorityIndicator score={issue.priorityScore} showScore={false} />
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{issue.title}</h4>

                  <p className="text-[11px] text-slate-600 line-clamp-2">{issue.address}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <StatusBadge status={issue.status} size="sm" />
                    <Link
                      to={`/issues/${issue.id}`}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 underline"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
