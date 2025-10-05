import { VOLUSIA_BOUNDS } from './constants';

export function isInVolusiaBounds(lat: number, lng: number): boolean {
  return (
    lat >= VOLUSIA_BOUNDS.south &&
    lat <= VOLUSIA_BOUNDS.north &&
    lng >= VOLUSIA_BOUNDS.west &&
    lng <= VOLUSIA_BOUNDS.east
  );
}

export function validateReportSubmission(
  latitude: number,
  longitude: number,
  severity: string
): { valid: boolean; error?: string } {
  if (!latitude || !longitude) {
    return { valid: false, error: 'Location is required' };
  }

  if (!isInVolusiaBounds(latitude, longitude)) {
    return {
      valid: false,
      error: 'Location must be within Volusia County',
    };
  }

  if (!['minor', 'moderate', 'severe'].includes(severity)) {
    return { valid: false, error: 'Invalid severity level' };
  }

  return { valid: true };
}
