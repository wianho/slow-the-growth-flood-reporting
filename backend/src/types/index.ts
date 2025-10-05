export interface FloodReport {
  id: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  road_name?: string;
  severity: 'minor' | 'moderate' | 'severe';
  device_fingerprint: string;
  created_at: Date;
  expires_at: Date;
  confidence_score: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    road_name?: string;
    severity: string;
    created_at: string;
    confidence_score: number;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface ReportSubmission {
  latitude: number;
  longitude: number;
  road_name?: string;
  severity: 'minor' | 'moderate' | 'severe';
  device_fingerprint: string;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface RateLimitInfo {
  remaining: number;
  resetAt: Date;
}

export interface USGSGaugeData {
  siteCode: string;
  siteName: string;
  latitude: number;
  longitude: number;
  waterLevel: number;
  floodStage?: number;
  timestamp: Date;
}

export interface NOAAAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  severity: string;
  urgency: string;
  onset: Date;
  expires: Date;
  areaDesc: string;
}
