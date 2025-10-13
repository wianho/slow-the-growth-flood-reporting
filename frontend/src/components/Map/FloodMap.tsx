import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { FLORIDA_CENTER, MAP_ZOOM } from '../../utils/constants';
import { ReportMarker } from './ReportMarker';
import { FutureLandUseOverlay } from './FutureLandUseOverlay';
import { LayerToggle } from './LayerToggle';
import { useFloodReports } from '../../hooks/useFloodReports';
import 'leaflet/dist/leaflet.css';

// Component to track map bounds
function MapBoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: LatLngBounds) => void }) {
  const map = useMap();

  useEffect(() => {
    // Initial bounds
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
  });

  return null;
}

export function FloodMap() {
  const { data, isLoading, error } = useFloodReports();
  const [futureLandUseEnabled, setFutureLandUseEnabled] = useState(false);
  const [mapBounds, setMapBounds] = useState<LatLngBounds>();

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={FLORIDA_CENTER}
        zoom={MAP_ZOOM.initial}
        minZoom={MAP_ZOOM.min}
        maxZoom={MAP_ZOOM.max}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsTracker onBoundsChange={setMapBounds} />

        {/* Future Land Use Overlay (rendered below flood markers) */}
        <FutureLandUseOverlay bounds={mapBounds} visible={futureLandUseEnabled} />

        {/* Flood Report Markers (rendered on top) */}
        {data?.features.map((feature) => (
          <ReportMarker key={feature.properties.id} feature={feature} />
        ))}
      </MapContainer>

      {/* Layer Toggle Control */}
      <LayerToggle
        onFutureLandUseToggle={setFutureLandUseEnabled}
        futureLandUseEnabled={futureLandUseEnabled}
      />

      {isLoading && (
        <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded shadow-lg">
          Loading reports...
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 left-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg">
          Error loading reports
        </div>
      )}
    </div>
  );
}
