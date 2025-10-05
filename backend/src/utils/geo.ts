import { BoundingBox } from '../types';
import { VOLUSIA_BOUNDS } from './constants';

export function isPointInBounds(
  latitude: number,
  longitude: number,
  bounds: BoundingBox = VOLUSIA_BOUNDS
): boolean {
  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  );
}

export function getNextWednesdayAt5AM(): Date {
  const now = new Date();
  const result = new Date(now);

  // Set to 5 AM
  result.setHours(5, 0, 0, 0);

  // Get current day (0 = Sunday, 3 = Wednesday)
  const currentDay = result.getDay();
  const daysUntilWednesday = (3 - currentDay + 7) % 7;

  // If today is Wednesday but past 5 AM, go to next Wednesday
  if (daysUntilWednesday === 0 && now.getHours() >= 5) {
    result.setDate(result.getDate() + 7);
  } else if (daysUntilWednesday > 0) {
    result.setDate(result.getDate() + daysUntilWednesday);
  }

  return result;
}

export function toGeoJSON(latitude: number, longitude: number) {
  return `POINT(${longitude} ${latitude})`;
}

export function parseGeoJSON(geoString: string): { latitude: number; longitude: number } {
  // Parse PostGIS POINT format: POINT(lng lat)
  const match = geoString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (!match) {
    throw new Error('Invalid GeoJSON format');
  }
  return {
    longitude: parseFloat(match[1]),
    latitude: parseFloat(match[2]),
  };
}
