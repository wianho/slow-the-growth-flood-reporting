// Florida center (geometric center near Lake Wales) - for map display
export const FLORIDA_CENTER: [number, number] = [27.6648, -81.5158];

// Florida state boundaries (for map viewing - read access)
export const FLORIDA_BOUNDS = {
  north: 31.0,    // Northern panhandle border with Georgia/Alabama
  south: 24.5,    // Key West
  east: -80.0,    // Eastern Atlantic coast
  west: -87.6,    // Western panhandle border with Alabama
};

// Counties that can submit flood reports (write access)
export const REPORTING_COUNTIES: Record<string, { north: number; south: number; east: number; west: number }> = {
  volusia: {
    north: 29.3,
    south: 28.7,
    east: -80.7,
    west: -81.5,
  },
  palmBeach: {
    north: 27.0,
    south: 26.1,
    east: -80.0,
    west: -80.9,
  },
};

// Legacy aliases for backward compatibility
export const VOLUSIA_BOUNDS = REPORTING_COUNTIES.volusia;
export const VOLUSIA_CENTER: [number, number] = [29.0, -81.1];

// @ts-ignore - Vite env typing
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const SEVERITY_COLORS = {
  minor: '#fbbf24', // yellow-400
  moderate: '#f97316', // orange-500
  severe: '#dc2626', // red-600
};

export const SEVERITY_LABELS = {
  minor: 'Minor Flooding',
  moderate: 'Moderate Flooding',
  severe: 'Severe Flooding',
};

export const MAP_ZOOM = {
  initial: 7,   // Zoomed out to show all of Florida
  min: 6,       // Allow zoom out to see full state
  max: 18,
};
