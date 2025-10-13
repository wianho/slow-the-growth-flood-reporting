import { API_BASE_URL } from '../utils/constants';

export interface ZoningProperties {
  GENL_ZCODE: string;
  GenericDescription: string;
  OriginalZoningCode?: string;
  Acres?: number;
  CityName?: string;
  Z_DESCRIP?: string;
  JUR_ZONING?: string;
}

export interface ZoningFeature {
  type: 'Feature';
  id?: string | number;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: ZoningProperties;
}

export interface ZoningResponse {
  type: 'FeatureCollection';
  features: ZoningFeature[];
  metadata: {
    count: number;
    bbox?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    types?: string[];
    source: string;
    sourceUrl: string;
  };
}

export interface ZoningType {
  name: string;
  color: string;
  description: string;
}

export interface ZoningTypesResponse {
  types: Record<string, ZoningType>;
}

/**
 * Fetch zoning data for a bounding box
 */
export async function fetchZoningData(
  bbox?: { north: number; south: number; east: number; west: number },
  types?: string[]
): Promise<ZoningResponse> {
  const params = new URLSearchParams();

  if (bbox) {
    params.append('north', bbox.north.toString());
    params.append('south', bbox.south.toString());
    params.append('east', bbox.east.toString());
    params.append('west', bbox.west.toString());
  }

  if (types && types.length > 0) {
    params.append('types', types.join(','));
  }

  const url = `${API_BASE_URL}/gis/zoning?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch zoning data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get zoning information for a specific point
 */
export async function fetchZoningAtPoint(
  lat: number,
  lng: number
): Promise<{ found: boolean; zoning?: ZoningProperties; geometry?: any; message?: string }> {
  const url = `${API_BASE_URL}/gis/zoning/point?lat=${lat}&lng=${lng}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch zoning at point: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get available zoning types with colors and descriptions
 */
export async function fetchZoningTypes(): Promise<ZoningTypesResponse> {
  const url = `${API_BASE_URL}/gis/zoning/types`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch zoning types: ${response.statusText}`);
  }

  return response.json();
}
