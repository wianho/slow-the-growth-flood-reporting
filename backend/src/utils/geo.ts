import { BoundingBox } from '../types';
import { REPORTING_COUNTIES, FLORIDA_BOUNDS } from './constants';

export function isPointInBounds(
  latitude: number,
  longitude: number,
  bounds: BoundingBox
): boolean {
  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  );
}

export function isPointInReportingArea(latitude: number, longitude: number): boolean {
  // Check if point is in ANY of the reporting counties
  return Object.values(REPORTING_COUNTIES).some(bounds =>
    isPointInBounds(latitude, longitude, bounds)
  );
}

export function getCountyName(latitude: number, longitude: number): string | null {
  // Return the name of the county the point is in
  for (const [name, bounds] of Object.entries(REPORTING_COUNTIES)) {
    if (isPointInBounds(latitude, longitude, bounds)) {
      // Convert camelCase to readable name
      return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }
  }
  return null;
}

// Legacy aliases for backward compatibility
export const isPointInVolusia = isPointInReportingArea;
export function isPointInFlorida(latitude: number, longitude: number): boolean {
  return isPointInBounds(latitude, longitude, FLORIDA_BOUNDS);
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
