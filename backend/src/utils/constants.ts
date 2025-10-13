import { BoundingBox } from '../types';

// Florida state boundaries (for map display - read access)
export const FLORIDA_BOUNDS: BoundingBox = {
  north: 31.0,    // Northern panhandle border with Georgia/Alabama
  south: 24.5,    // Key West
  east: -80.0,    // Eastern Atlantic coast
  west: -87.6,    // Western panhandle border with Alabama
};

// Counties that can submit flood reports (write access)
// Add new counties here as they join the program
export const REPORTING_COUNTIES: Record<string, BoundingBox> = {
  volusia: {
    north: 29.3,
    south: 28.7,
    east: -80.7,
    west: -81.5,
  },
  palmBeach: {
    north: 27.0,    // Northern Palm Beach County
    south: 26.1,    // Southern Palm Beach County (near Boca Raton)
    east: -80.0,    // Atlantic coast
    west: -80.9,    // Western edge (near Lake Okeechobee)
  },
};

// Legacy alias for backward compatibility
export const VOLUSIA_BOUNDS = REPORTING_COUNTIES.volusia;

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

// Florida USGS gauge station IDs (major gauges across the state)
// This is a sample set - can be expanded with more gauges
export const FLORIDA_USGS_GAUGES = [
  // North Florida
  '02231000', // St. Johns River at Jacksonville
  '02246500', // St. Johns River near Deland
  // Central Florida
  '02248380', // Spruce Creek near Samsula (Volusia)
  '02248000', // Tomoka River near Holly Hill (Volusia)
  '02249007', // Lake Ashby at New Smyrna Beach (Volusia)
  '02266300', // Kissimmee River at S65E near Okeechobee
  '02289500', // Miami Canal at S-8 near Miami
  // South Florida
  '02291500', // Tamiami Canal at S-12C near Miami
  '02290710', // Shark River near Homestead
];

// Legacy alias
export const VOLUSIA_USGS_GAUGES = FLORIDA_USGS_GAUGES;

// NWS Zone IDs for all of Florida
export const FLORIDA_NWS_ZONES = [
  // Panhandle
  'FLZ001', 'FLZ002', 'FLZ003', 'FLZ004', 'FLZ005', 'FLZ006', 'FLZ007', 'FLZ008',
  'FLZ009', 'FLZ010', 'FLZ011', 'FLZ012', 'FLZ013', 'FLZ014',
  // North Florida
  'FLZ015', 'FLZ016', 'FLZ017', 'FLZ018', 'FLZ019', 'FLZ020', 'FLZ021', 'FLZ022',
  'FLZ023', 'FLZ024', 'FLZ025', 'FLZ026', 'FLZ027', 'FLZ028', 'FLZ029', 'FLZ030',
  // Central Florida
  'FLZ031', 'FLZ032', 'FLZ033', 'FLZ034', 'FLZ035', 'FLZ036', 'FLZ037', 'FLZ038',
  'FLZ039', 'FLZ040', 'FLZ041', 'FLZ042', 'FLZ043', 'FLZ044', 'FLZ045', 'FLZ046',
  'FLZ047', 'FLZ048', 'FLZ049', 'FLZ050', 'FLZ051', 'FLZ052', 'FLZ053',
  // South Florida
  'FLZ060', 'FLZ061', 'FLZ062', 'FLZ063', 'FLZ064', 'FLZ065', 'FLZ066', 'FLZ067',
  'FLZ068', 'FLZ069', 'FLZ070', 'FLZ071', 'FLZ072', 'FLZ073', 'FLZ074', 'FLZ075',
  // Coastal Zones
  'FLZ108', 'FLZ112', 'FLZ114', 'FLZ115', 'FLZ118', 'FLZ127', 'FLZ133', 'FLZ134',
  'FLZ136', 'FLZ138', 'FLZ141', 'FLZ142', 'FLZ144', 'FLZ148', 'FLZ149', 'FLZ151',
  'FLZ154', 'FLZ155', 'FLZ159', 'FLZ160', 'FLZ162', 'FLZ164', 'FLZ165', 'FLZ168',
  'FLZ172', 'FLZ173', 'FLZ174', 'FLZ179',
];

// Legacy alias
export const VOLUSIA_NWS_ZONES = FLORIDA_NWS_ZONES;
