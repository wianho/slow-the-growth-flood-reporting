import axios from 'axios';
import logger from '../utils/logger';

const VOLUSIA_GIS_URL =
  process.env.VOLUSIA_GIS_URL || 'https://maps.vcgov.org/arcgis/rest/services';

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | undefined> {
  try {
    // This is a placeholder - actual Volusia County GIS endpoint would be used
    // For now, return undefined to allow optional road_name
    logger.debug('Reverse geocoding', { latitude, longitude });
    return undefined;
  } catch (error) {
    logger.error('Error reverse geocoding', error);
    return undefined;
  }
}

export async function getFloodZones(latitude: number, longitude: number): Promise<any> {
  try {
    // Placeholder for fetching flood zone data from Volusia County GIS
    logger.debug('Getting flood zones', { latitude, longitude });
    return null;
  } catch (error) {
    logger.error('Error fetching flood zones', error);
    return null;
  }
}
