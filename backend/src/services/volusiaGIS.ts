import axios from 'axios';
import logger from '../utils/logger';

const VOLUSIA_GIS_BASE_URL = 'https://maps1.vcgov.org/arcgis/rest/services';
const ZONING_SERVICE_URL = `${VOLUSIA_GIS_BASE_URL}/CountywideZoning/MapServer/2`;

export interface ZoningFeature {
  type: 'Feature';
  id: string | number;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    GENL_ZCODE: string;
    GenericDescription: string;
    OriginalZoningCode?: string;
    Acres?: number;
    CityName?: string;
    Z_DESCRIP?: string;
    JUR_ZONING?: string;
  };
}

export interface ZoningFeatureCollection {
  type: 'FeatureCollection';
  features: ZoningFeature[];
}

/**
 * Fetch zoning data from Volusia County ArcGIS REST API
 * @param bbox Bounding box [west, south, east, north]
 * @param zoningTypes Optional array of zoning codes to filter (e.g., ['COM', 'IND'])
 */
export async function getVolusiaZoning(
  bbox?: { west: number; south: number; east: number; north: number },
  zoningTypes?: string[]
): Promise<ZoningFeatureCollection> {
  try {
    // Build query parameters
    const params: Record<string, any> = {
      where: '1=1', // Default: return all features
      outFields: 'OBJECTID,GENL_ZCODE,GenericDescription,OriginalZoningCode,Acres,CityName,Z_DESCRIP,JUR_ZONING',
      returnGeometry: true,
      outSR: 4326, // WGS84 coordinate system
      f: 'geojson',
    };

    // Add bounding box filter if provided
    if (bbox) {
      params.geometry = `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;
      params.geometryType = 'esriGeometryEnvelope';
      params.spatialRel = 'esriSpatialRelIntersects';
      params.inSR = 4326;
    }

    // Add zoning type filter if provided
    if (zoningTypes && zoningTypes.length > 0) {
      const zoningFilter = zoningTypes.map(code => `'${code}'`).join(',');
      params.where = `GENL_ZCODE IN (${zoningFilter})`;
    }

    logger.info('Fetching Volusia zoning data', {
      bbox,
      zoningTypes,
      url: `${ZONING_SERVICE_URL}/query`,
    });

    const response = await axios.get(`${ZONING_SERVICE_URL}/query`, {
      params,
      timeout: 30000, // 30 second timeout
    });

    if (response.data && response.data.features) {
      logger.info('Successfully fetched zoning data', {
        featureCount: response.data.features.length,
      });

      return response.data as ZoningFeatureCollection;
    }

    throw new Error('Invalid response format from Volusia GIS service');
  } catch (error: any) {
    logger.error('Failed to fetch Volusia zoning data', {
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Failed to fetch zoning data: ${error.message}`);
  }
}

/**
 * Get zoning information for a specific point
 * @param latitude Latitude coordinate
 * @param longitude Longitude coordinate
 */
export async function getZoningAtPoint(
  latitude: number,
  longitude: number
): Promise<ZoningFeature | null> {
  try {
    const params = {
      geometry: `${longitude},${latitude}`,
      geometryType: 'esriGeometryPoint',
      inSR: 4326,
      spatialRel: 'esriSpatialRelIntersects',
      outFields: 'OBJECTID,GENL_ZCODE,GenericDescription,OriginalZoningCode,Acres,CityName,Z_DESCRIP,JUR_ZONING',
      returnGeometry: true,
      outSR: 4326,
      f: 'geojson',
    };

    const response = await axios.get(`${ZONING_SERVICE_URL}/query`, {
      params,
      timeout: 10000,
    });

    if (response.data && response.data.features && response.data.features.length > 0) {
      return response.data.features[0] as ZoningFeature;
    }

    return null;
  } catch (error: any) {
    logger.error('Failed to fetch zoning at point', {
      latitude,
      longitude,
      error: error.message,
    });
    throw new Error(`Failed to fetch zoning at point: ${error.message}`);
  }
}

/**
 * Get available zoning types with their descriptions
 */
export const ZONING_TYPES = {
  AGR: { name: 'Agriculture', color: '#90EE90', description: 'Agricultural use' },
  RES: { name: 'Residential', color: '#FFD700', description: 'Residential development' },
  COM: { name: 'Commercial', color: '#FF6B6B', description: 'Commercial development' },
  IND: { name: 'Industrial', color: '#9370DB', description: 'Industrial use' },
  PUD: { name: 'Planned Unit Development', color: '#20B2AA', description: 'Mixed-use planned development' },
  MIXED: { name: 'Mixed Use', color: '#FFA500', description: 'Mixed commercial and residential' },
  CON: { name: 'Conservation', color: '#228B22', description: 'Conservation and preservation' },
  PF: { name: 'Public Facilities', color: '#4682B4', description: 'Government and public use' },
  REC: { name: 'Recreation', color: '#7CFC00', description: 'Parks and recreation' },
};

/**
 * Get color for a zoning code
 */
export function getZoningColor(zoningCode: string): string {
  const zoning = ZONING_TYPES[zoningCode as keyof typeof ZONING_TYPES];
  return zoning?.color || '#CCCCCC'; // Default gray for unknown types
}
