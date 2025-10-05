import { BoundingBox } from '../types';

export const VOLUSIA_BOUNDS: BoundingBox = {
  north: 29.3,
  south: 28.7,
  east: -80.7,
  west: -81.5,
};

export const REPORTS_PER_DAY = 3;
export const NEARBY_REPORT_DISTANCE_METERS = 100;
export const NEARBY_REPORT_TIME_HOURS = 2;
export const JWT_EXPIRY = '24h';

export const ROTATION_CONFIG = {
  day: 3, // Wednesday (0 = Sunday)
  hour: 5,
  timezone: 'America/New_York',
};

export const CACHE_TTL = {
  NOAA: 300, // 5 minutes
  USGS: 900, // 15 minutes
};

// Volusia County USGS gauge station IDs
export const VOLUSIA_USGS_GAUGES = [
  '02248380', // Spruce Creek near Samsula
  '02248000', // Tomoka River near Holly Hill
  '02249007', // Lake Ashby at New Smyrna Beach
];

// NWS Zone IDs for Volusia County
export const VOLUSIA_NWS_ZONES = [
  'FLZ041', // Coastal Volusia
  'FLZ141', // Inland Volusia
];
