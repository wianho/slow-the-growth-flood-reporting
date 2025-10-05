CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE flood_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  road_name VARCHAR(255),
  severity VARCHAR(20) CHECK (severity IN ('minor', 'moderate', 'severe')),
  device_fingerprint VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  confidence_score INTEGER DEFAULT 1,
  CONSTRAINT valid_location CHECK (ST_Within(
    location::geometry,
    ST_MakeEnvelope(-81.5, 28.7, -80.7, 29.3, 4326)
  ))
);

CREATE TABLE flood_reports_archive (
  id UUID PRIMARY KEY,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  road_name VARCHAR(255),
  severity VARCHAR(20),
  device_fingerprint VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  confidence_score INTEGER
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID,
  action VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
