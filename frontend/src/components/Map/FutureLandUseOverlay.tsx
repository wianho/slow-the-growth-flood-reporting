import React from 'react';
import { GeoJSON } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { fetchFutureLandUse, ZoningFeature, ZoningResponse } from '../../services/gis';

interface FutureLandUseOverlayProps {
  visible: boolean;
  filterTypes?: string[];
}

export function FutureLandUseOverlay({ visible, filterTypes }: FutureLandUseOverlayProps) {
  // Fetch entire county's Future Land Use data when overlay is enabled
  // This loads 2000 features covering all of Volusia County
  // No bbox = county-wide data, no debouncing needed, no zoom restrictions
  const { data, isLoading, error } = useQuery<ZoningResponse>({
    queryKey: ['futureLandUse', 'countyWide', filterTypes],
    queryFn: () => fetchFutureLandUse(undefined, filterTypes, 2000),  // No bbox = entire county
    enabled: visible,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour (long-lived since county data doesn't change often)
    gcTime: 60 * 60 * 1000, // Renamed from cacheTime in React Query v5
    retry: 2,
  });

  if (!visible) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="absolute top-20 right-4 bg-white px-4 py-2 rounded shadow-lg z-[1000]">
        <p className="text-sm text-gray-600">Loading county-wide planned development data...</p>
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

  if (!data || !data.features || data.features.length === 0) {
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
          This shows PLANNED land use, not current zoning.
        </p>
      </div>
    `;
    layer.bindPopup(popupContent);
  };

  return (
    <GeoJSON
      key={JSON.stringify(data.features.map(f => f.id))}
      data={data as any}
      style={(feature) => getFLUStyle(feature as ZoningFeature)}
      onEachFeature={onEachFeature}
    />
  );
}
