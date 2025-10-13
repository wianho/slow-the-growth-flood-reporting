import React, { useEffect, useState, useRef } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { fetchFutureLandUse, ZoningFeature, ZoningResponse } from '../../services/gis';
import { LatLngBounds } from 'leaflet';

interface FutureLandUseOverlayProps {
  bounds?: LatLngBounds;
  visible: boolean;
  filterTypes?: string[];
}

// Minimum zoom level to show overlay (performance optimization)
const MIN_ZOOM_LEVEL = 11;
// Expand fetch area by this factor to reduce refetching on pan
const FETCH_AREA_MULTIPLIER = 1.5;
// Debounce delay in ms (reduced for better responsiveness)
const DEBOUNCE_DELAY = 250;

export function FutureLandUseOverlay({ bounds, visible, filterTypes }: FutureLandUseOverlayProps) {
  const map = useMap();
  const [bbox, setBbox] = useState<{ north: number; south: number; east: number; west: number }>();
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());
  const debounceTimerRef = useRef<number>();

  useEffect(() => {
    if (bounds) {
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }

      // Debounce bbox updates to reduce API calls during map movement
      debounceTimerRef.current = window.setTimeout(() => {
        // Expand the bbox by FETCH_AREA_MULTIPLIER to fetch more data than visible
        // This reduces the need for refetching when the user pans slightly
        const latDiff = bounds.getNorth() - bounds.getSouth();
        const lngDiff = bounds.getEast() - bounds.getWest();
        const latExpand = (latDiff * (FETCH_AREA_MULTIPLIER - 1)) / 2;
        const lngExpand = (lngDiff * (FETCH_AREA_MULTIPLIER - 1)) / 2;

        setBbox({
          north: bounds.getNorth() + latExpand,
          south: bounds.getSouth() - latExpand,
          east: bounds.getEast() + lngExpand,
          west: bounds.getWest() - lngExpand,
        });
      }, DEBOUNCE_DELAY);
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [bounds]);

  // Track zoom level
  useEffect(() => {
    const handleZoom = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map]);

  // Only fetch data if zoomed in enough
  const shouldFetch = visible && !!bbox && currentZoom >= MIN_ZOOM_LEVEL;

  // Round bbox to grid for better cache hits
  // Nearby map positions will share the same cache key
  const roundedBbox = bbox ? {
    north: Math.ceil(bbox.north * 20) / 20,   // Round to 0.05 degree grid
    south: Math.floor(bbox.south * 20) / 20,
    east: Math.ceil(bbox.east * 20) / 20,
    west: Math.floor(bbox.west * 20) / 20,
  } : undefined;

  const { data, isLoading, error } = useQuery<ZoningResponse>({
    queryKey: ['futureLandUse', roundedBbox, filterTypes, currentZoom],
    queryFn: () => fetchFutureLandUse(bbox, filterTypes, 500),  // Use actual bbox for fetch
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  if (!visible) {
    return null;
  }

  // Show zoom message if not zoomed in enough
  if (currentZoom < MIN_ZOOM_LEVEL) {
    return (
      <div className="absolute top-20 right-4 bg-blue-50 border border-blue-400 text-blue-800 px-4 py-2 rounded shadow-lg z-[1000] max-w-xs">
        <p className="text-sm font-medium">Zoom in to view Future Land Use</p>
        <p className="text-xs mt-1">Shows planned development areas (better performance when zoomed in)</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="absolute top-20 right-4 bg-white px-4 py-2 rounded shadow-lg z-[1000]">
        <p className="text-sm text-gray-600">Loading Future Land Use data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-20 right-4 bg-red-50 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg z-[1000]">
        <p className="text-sm">Failed to load Future Land Use data</p>
      </div>
    );
  }

  if (!data || data.features.length === 0) {
    return null;
  }

  // Style function for Future Land Use polygons
  const getFLUStyle = (feature: ZoningFeature) => {
    const luCode = feature.properties.LUCODE || feature.properties.LUNAME || '';

    // Color map for common land use types (adjusted for planned development)
    const colors: Record<string, string> = {
      // Residential types
      'R': '#FFB84D',     // Residential - orange
      'RL': '#FFA500',    // Residential Low - light orange
      'RM': '#FF8C00',    // Residential Medium - medium orange
      'RH': '#FF6B00',    // Residential High - dark orange

      // Commercial types
      'C': '#FF6B6B',     // Commercial - red
      'CG': '#DC143C',    // Commercial General - crimson

      // Industrial types
      'I': '#9370DB',     // Industrial - purple
      'IL': '#8A2BE2',    // Industrial Light - blue violet

      // Conservation/Open Space
      'CON': '#228B22',   // Conservation - forest green
      'OS': '#90EE90',    // Open Space - light green
      'PR': '#7CFC00',    // Parks/Rec - lawn green

      // Mixed/Planned
      'MU': '#20B2AA',    // Mixed Use - light sea green
      'PUD': '#00CED1',   // Planned Unit Development - dark turquoise

      // Agriculture
      'AG': '#98FB98',    // Agriculture - pale green

      // Public/Institutional
      'P': '#4682B4',     // Public - steel blue
      'PI': '#5F9EA0',    // Public/Institutional - cadet blue
    };

    // Try to match the code prefix
    let color = '#CCCCCC'; // default gray
    for (const [key, value] of Object.entries(colors)) {
      if (luCode.toUpperCase().startsWith(key)) {
        color = value;
        break;
      }
    }

    return {
      fillColor: color,
      weight: 1,
      opacity: 0.6,
      color: '#333',
      fillOpacity: 0.4,
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
          fillOpacity: 0.6,
        });
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1,
          fillOpacity: 0.4,
        });
      },
    });

    // Bind popup with Future Land Use details
    const props = feature.properties;
    const popupContent = `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2 text-blue-700">📋 Future Land Use</h3>
        <div class="text-sm space-y-1">
          <p><strong>Land Use:</strong> ${props.LUNAME || props.LUCODE || 'Unknown'}</p>
          ${props.LUCODE ? `<p><strong>Code:</strong> ${props.LUCODE}</p>` : ''}
          ${props.AMEND ? `<p><strong>Amendment:</strong> ${props.AMEND}</p>` : ''}
          ${props.PLANNED_COMM ? `<p><strong>Planned Community:</strong> ${props.PLANNED_COMM}</p>` : ''}
          ${props.ACTIVITY_CENTER ? `<p><strong>Activity Center:</strong> ${props.ACTIVITY_CENTER}</p>` : ''}
          ${props.LOCAL_PLAN_AREAS ? `<p><strong>Local Plan:</strong> ${props.LOCAL_PLAN_AREAS}</p>` : ''}
          ${props.last_edited_date ? `<p class="mt-2 text-xs text-gray-600"><strong>Last Updated:</strong> ${new Date(props.last_edited_date).toLocaleDateString()}</p>` : ''}
        </div>
        <p class="mt-2 text-xs italic text-gray-600">
          This shows PLANNED land use, not current zoning. Perfect for advocacy!
        </p>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  return (
    <>
      <GeoJSON
        key={JSON.stringify(data.features.map(f => f.id))}
        data={data as any}
        style={(feature) => getFLUStyle(feature as ZoningFeature)}
        onEachFeature={onEachFeature}
      />
      {data.metadata && data.metadata.count >= 500 && (
        <div className="absolute bottom-20 right-4 bg-yellow-50 border border-yellow-400 text-yellow-800 px-3 py-2 rounded shadow-lg z-[1000] text-xs">
          <p>Showing 500 of {data.metadata.count}+ features. Zoom in for more detail.</p>
        </div>
      )}
    </>
  );
}
