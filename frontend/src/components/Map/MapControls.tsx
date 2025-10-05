import React from 'react';

interface MapControlsProps {
  onRecenter: () => void;
}

export function MapControls({ onRecenter }: MapControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2">
      <button
        onClick={onRecenter}
        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
        title="Recenter map to your location"
      >
        📍 My Location
      </button>
    </div>
  );
}
