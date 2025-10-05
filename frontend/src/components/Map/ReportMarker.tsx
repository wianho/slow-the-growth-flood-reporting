import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { GeoJSONFeature } from '../../types';
import { SEVERITY_COLORS, SEVERITY_LABELS } from '../../utils/constants';
import { formatDistanceToNow } from 'date-fns';

interface ReportMarkerProps {
  feature: GeoJSONFeature;
}

export function ReportMarker({ feature }: ReportMarkerProps) {
  const { coordinates } = feature.geometry;
  const { severity, road_name, created_at, confidence_score } = feature.properties;

  const color = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS];

  const icon = new Icon({
    iconUrl: `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <Marker position={[coordinates[1], coordinates[0]]} icon={icon}>
      <Popup>
        <div className="p-2">
          <h3 className="font-bold text-lg mb-2">
            {SEVERITY_LABELS[severity as keyof typeof SEVERITY_LABELS]}
          </h3>
          {road_name && (
            <p className="text-sm mb-1">
              <strong>Location:</strong> {road_name}
            </p>
          )}
          <p className="text-sm mb-1">
            <strong>Confidence:</strong> {confidence_score} {confidence_score === 1 ? 'report' : 'reports'}
          </p>
          <p className="text-xs text-gray-600">
            Reported {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}
