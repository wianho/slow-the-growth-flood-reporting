import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { VOLUSIA_CENTER, MAP_ZOOM } from '../../utils/constants';
import { ReportMarker } from './ReportMarker';
import { useFloodReports } from '../../hooks/useFloodReports';
import 'leaflet/dist/leaflet.css';

export function FloodMap() {
  const { data, isLoading, error } = useFloodReports();

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={VOLUSIA_CENTER}
        zoom={MAP_ZOOM.initial}
        minZoom={MAP_ZOOM.min}
        maxZoom={MAP_ZOOM.max}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data?.features.map((feature) => (
          <ReportMarker key={feature.properties.id} feature={feature} />
        ))}
      </MapContainer>

      {isLoading && (
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded shadow-lg">
          Loading reports...
        </div>
      )}

      {error && (
        <div className="absolute top-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg">
          Error loading reports
        </div>
      )}
    </div>
  );
}
