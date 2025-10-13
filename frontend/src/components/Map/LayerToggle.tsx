import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchZoningTypes, ZoningTypesResponse } from '../../services/gis';

interface LayerToggleProps {
  onZoningToggle: (enabled: boolean) => void;
  zoningEnabled: boolean;
}

export function LayerToggle({ onZoningToggle, zoningEnabled }: LayerToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: zoningTypes } = useQuery<ZoningTypesResponse>({
    queryKey: ['zoningTypes'],
    queryFn: fetchZoningTypes,
    staleTime: Infinity, // These don't change often
  });

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg z-[1000] max-w-xs">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Map Layers</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
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
        <div className="px-4 py-3 space-y-3">
          {/* Zoning Layer Toggle */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={zoningEnabled}
                onChange={(e) => onZoningToggle(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Show Zoning Overlay</span>
            </label>

            {/* Zoning Legend */}
            {zoningEnabled && zoningTypes && (
              <div className="ml-6 mt-2 space-y-1 text-xs">
                <p className="font-semibold text-gray-600 mb-1">Zoning Types:</p>
                {Object.entries(zoningTypes.types).map(([code, info]) => (
                  <div key={code} className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 border border-gray-300 rounded"
                      style={{ backgroundColor: info.color }}
                    ></div>
                    <span className="text-gray-700">{info.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Text */}
          <div className="pt-2 border-t border-gray-200">
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
        <div className="px-4 py-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={zoningEnabled}
              onChange={(e) => onZoningToggle(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Zoning</span>
          </label>
        </div>
      )}
    </div>
  );
}
