import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchZoningTypes, ZoningTypesResponse } from '../../services/gis';

interface LayerToggleProps {
  onFutureLandUseToggle: (enabled: boolean) => void;
  futureLandUseEnabled: boolean;
}

export function LayerToggle({ onFutureLandUseToggle, futureLandUseEnabled }: LayerToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg z-[1000] max-w-[85vw] sm:max-w-xs">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Layers</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3">
          {/* Future Land Use Layer Toggle */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={futureLandUseEnabled}
                onChange={(e) => onFutureLandUseToggle(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Show Planned Development</span>
            </label>

            {/* Info Text - More compact on mobile */}
            {futureLandUseEnabled && (
              <div className="ml-5 sm:ml-6 mt-1 sm:mt-2 space-y-1 text-xs">
                <p className="text-gray-600">
                  Shows <strong>Future Land Use</strong> - where development is PLANNED
                </p>
                <p className="text-gray-500 hidden sm:block">
                  💡 Zoom in (level 11+) to see detailed polygons
                </p>
              </div>
            )}
          </div>

          {/* Info Text - Hidden on mobile when expanded to save space */}
          <div className="pt-2 border-t border-gray-200 hidden sm:block">
            <p className="text-xs text-gray-500">
              Data source: <a
                href="https://opendata-volusiacountyfl.hub.arcgis.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Volusia County GIS
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Compact View (when collapsed) */}
      {!isExpanded && (
        <div className="px-3 sm:px-4 py-1.5 sm:py-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={futureLandUseEnabled}
              onChange={(e) => onFutureLandUseToggle(e.target.checked)}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-xs sm:text-sm text-gray-700">Planned Dev</span>
          </label>
        </div>
      )}
    </div>
  );
}
