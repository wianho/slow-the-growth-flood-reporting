import { FLORIDA_BOUNDS, REPORTING_COUNTIES } from './constants';

export function isInFloridaBounds(lat: number, lng: number): boolean {
  return (
    lat >= FLORIDA_BOUNDS.south &&
    lat <= FLORIDA_BOUNDS.north &&
    lng >= FLORIDA_BOUNDS.west &&
    lng <= FLORIDA_BOUNDS.east
  );
}

export function isInReportingArea(lat: number, lng: number): boolean {
  // Check if point is in ANY of the reporting counties
  return Object.values(REPORTING_COUNTIES).some(bounds =>
    lat >= bounds.south &&
    lat <= bounds.north &&
    lng >= bounds.west &&
    lng <= bounds.east
  );
}

export function getCountyName(lat: number, lng: number): string | null {
  for (const [name, bounds] of Object.entries(REPORTING_COUNTIES)) {
    if (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    ) {
      // Convert camelCase to readable name
      return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }
  }
  return null;
}

// Legacy alias for backward compatibility
export const isInVolusiaBounds = isInReportingArea;

export function validateReportSubmission(
  latitude: number,
  longitude: number,
  severity: string
): { valid: boolean; error?: string } {
  if (!latitude || !longitude) {
    return { valid: false, error: 'Location is required' };
  }

  if (!isInReportingArea(latitude, longitude)) {
    return {
      valid: false,
      error: 'Reports can only be submitted from participating counties (Volusia and Palm Beach). The map displays statewide data for public awareness.',
    };
  }

  if (!['minor', 'moderate', 'severe'].includes(severity)) {
    return { valid: false, error: 'Invalid severity level' };
  }

  return { valid: true };
}
