import React, { useEffect, useState } from 'react';
import { GeoJSON, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { fetchZoningData, ZoningFeature, ZoningResponse } from '../../services/gis';
import { LatLngBounds } from 'leaflet';

interface ZoningOverlayProps {
  bounds?: LatLngBounds;
  visible: boolean;
  filterTypes?: string[];
}

export function ZoningOverlay({ bounds, visible, filterTypes }: ZoningOverlayProps) {
  const [bbox, setBbox] = useState<{ north: number; south: number; east: number; west: number }>();

  useEffect(() => {
    if (bounds) {
      setBbox({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    }
  }, [bounds]);

  const { data, isLoading, error } = useQuery<ZoningResponse>({
    queryKey: ['zoning', bbox, filterTypes],
    queryFn: () => fetchZoningData(bbox, filterTypes),
    enabled: visible && !!bbox,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  if (!visible) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="absolute top-20 right-4 bg-white px-4 py-2 rounded shadow-lg z-[1000]">
        <p className="text-sm text-gray-600">Loading zoning data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-20 right-4 bg-red-50 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg z-[1000]">
        <p className="text-sm">Failed to load zoning data</p>
      </div>
    );
  }

  if (!data || data.features.length === 0) {
    return null;
  }

  // Style function for zoning polygons
  const getZoningStyle = (feature: ZoningFeature) => {
    const zoningCode = feature.properties.GENL_ZCODE;
    const colors: Record<string, string> = {
      AGR: '#90EE90',
      RES: '#FFD700',
      COM: '#FF6B6B',
      IND: '#9370DB',
      PUD: '#20B2AA',
      MIXED: '#FFA500',
      CON: '#228B22',
      PF: '#4682B4',
      REC: '#7CFC00',
    };

    return {
      fillColor: colors[zoningCode] || '#CCCCCC',
      weight: 1,
      opacity: 0.5,
      color: '#333',
      fillOpacity: 0.3,
    };
  };

  // Event handlers
  const onEachFeature = (feature: any, layer: any) => {
    // Highlight on hover
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          fillOpacity: 0.5,
        });
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1,
          fillOpacity: 0.3,
        });
      },
    });

    // Bind popup
    const props = feature.properties;
    const popupContent = `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${props.GenericDescription || props.GENL_ZCODE}</h3>
        <div class="text-sm space-y-1">
          <p><strong>Zoning Code:</strong> ${props.GENL_ZCODE}</p>
          ${props.OriginalZoningCode ? `<p><strong>Original Code:</strong> ${props.OriginalZoningCode}</p>` : ''}
          ${props.Acres ? `<p><strong>Acres:</strong> ${props.Acres.toFixed(2)}</p>` : ''}
          ${props.CityName ? `<p><strong>City:</strong> ${props.CityName}</p>` : ''}
          ${props.Z_DESCRIP ? `<p class="mt-2"><em>${props.Z_DESCRIP}</em></p>` : ''}
        </div>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  return (
    <>
      <GeoJSON
        key={JSON.stringify(data.features.map(f => f.id))}
        data={data as any}
        style={(feature) => getZoningStyle(feature as ZoningFeature)}
        onEachFeature={onEachFeature}
      />
    </>
  );
}
