export const VOLUSIA_CENTER: [number, number] = [29.0, -81.1];

export const VOLUSIA_BOUNDS = {
  north: 29.3,
  south: 28.7,
  east: -80.7,
  west: -81.5,
};

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
  initial: 10,
  min: 8,
  max: 18,
};
