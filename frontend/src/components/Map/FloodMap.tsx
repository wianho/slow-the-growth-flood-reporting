import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { FLORIDA_CENTER, MAP_ZOOM } from '../../utils/constants';
import { ReportMarker } from './ReportMarker';
import { FutureLandUseOverlay } from './FutureLandUseOverlay';
import { LayerToggle } from './LayerToggle';
import { WeekSlider } from './WeekSlider';
import { getReports, getArchivedReports } from '../../services/api';
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
  const [futureLandUseEnabled, setFutureLandUseEnabled] = useState(false);
  const [mapBounds, setMapBounds] = useState<LatLngBounds>();
  const [weekOffset, setWeekOffset] = useState(0);

  // Fetch reports (active or archived based on weekOffset)
  const { data, isLoading, error } = useQuery({
    queryKey: ['floodReports', weekOffset],
    queryFn: () => weekOffset === 0 ? getReports() : getArchivedReports(weekOffset),
    refetchInterval: weekOffset === 0 ? 60000 : undefined, // Only auto-refresh current week
    staleTime: 30000,
  });

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

      {/* Week Slider */}
      <WeekSlider weekOffset={weekOffset} onWeekChange={setWeekOffset} maxWeeks={12} />

      {isLoading && (
        <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded shadow-lg z-[1001]">
          Loading reports...
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg z-[1001]">
          Error loading reports
        </div>
      )}
    </div>
  );
}
