import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { StatusBadge } from '../issues/StatusBadge';
import { PriorityIndicator } from '../issues/PriorityIndicator';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

// Custom Marker Icons generator based on status & severity
function createCustomMarkerIcon(status = 'OPEN', priorityScore = 50) {
  let color = '#2563eb'; // Blue for open
  if (status === 'UNDER_REVIEW') color = '#d97706'; // Amber
  if (status === 'IN_PROGRESS') color = '#7c3aed'; // Purple
  if (status === 'RESOLVED') color = '#059669'; // Green
  if (status === 'REJECTED') color = '#e11d48'; // Red

  const svgMarker = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-map-marker',
    html: svgMarker,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function IssueMap({
  issues = [],
  center = [37.774929, -122.419416],
  zoom = 13,
  height = '500px',
  onMarkerSelect,
}) {
  return (
    <div style={{ height }} className="w-full relative rounded-xl overflow-hidden border border-slate-200 shadow-card">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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
