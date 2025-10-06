export interface FloodReport {
  id: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  road_name?: string;
  severity: 'minor' | 'moderate' | 'severe';
  created_at: string;
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
    is_own_report?: boolean;
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
}

export interface USGSGauge {
  siteCode: string;
  siteName: string;
  latitude: number;
  longitude: number;
  waterLevel: number;
  floodStage?: number;
  timestamp: string;
}

export interface NOAAAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  severity: string;
  urgency: string;
  onset: string;
  expires: string;
  areaDesc: string;
}
