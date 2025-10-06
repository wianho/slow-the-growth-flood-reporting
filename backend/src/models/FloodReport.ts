import { query } from '../services/database';
import { FloodReport, GeoJSONFeatureCollection, ReportSubmission } from '../types';
import { getNextWednesdayAt5AM, toGeoJSON } from '../utils/geo';
import {
  NEARBY_REPORT_DISTANCE_METERS,
  NEARBY_REPORT_TIME_HOURS,
} from '../utils/constants';
import logger from '../utils/logger';

export async function createReport(submission: ReportSubmission): Promise<FloodReport> {
  const { latitude, longitude, road_name, severity, device_fingerprint } = submission;

  // Check for nearby reports to increment confidence
  const nearbyCount = await getNearbyReportCount(latitude, longitude);
  const confidence_score = nearbyCount + 1;

  const expires_at = getNextWednesdayAt5AM();
  const locationGeo = toGeoJSON(latitude, longitude);

  const result = await query(
    `INSERT INTO flood_reports (location, road_name, severity, device_fingerprint, expires_at, confidence_score)
     VALUES (ST_GeographyFromText($1), $2, $3, $4, $5, $6)
     RETURNING id, ST_AsText(location) as location, road_name, severity, device_fingerprint, created_at, expires_at, confidence_score`,
    [locationGeo, road_name, severity, device_fingerprint, expires_at, confidence_score]
  );

  const row = result.rows[0];
  const [lng, lat] = row.location.match(/POINT\(([^ ]+) ([^ ]+)\)/).slice(1).map(parseFloat);

  return {
    id: row.id,
    location: { type: 'Point', coordinates: [lng, lat] },
    road_name: row.road_name,
    severity: row.severity,
    device_fingerprint: row.device_fingerprint,
    created_at: row.created_at,
    expires_at: row.expires_at,
    confidence_score: row.confidence_score,
  };
}

async function getNearbyReportCount(latitude: number, longitude: number): Promise<number> {
  const hoursAgo = new Date(Date.now() - NEARBY_REPORT_TIME_HOURS * 60 * 60 * 1000);
  const locationGeo = toGeoJSON(latitude, longitude);

  const result = await query(
    `SELECT COUNT(*) as count
     FROM flood_reports
     WHERE ST_DWithin(location, ST_GeographyFromText($1), $2)
     AND created_at > $3`,
    [locationGeo, NEARBY_REPORT_DISTANCE_METERS, hoursAgo]
  );

  return parseInt(result.rows[0].count, 10);
}

export async function getActiveReports(
  bbox?: { north: number; south: number; east: number; west: number },
  minConfidence?: number,
  deviceFingerprint?: string
): Promise<GeoJSONFeatureCollection> {
  let queryText = `
    SELECT id, ST_AsText(location) as location, road_name, severity, created_at, confidence_score, device_fingerprint
    FROM flood_reports
    WHERE expires_at > NOW()
  `;
  const params: any[] = [];

  if (bbox) {
    params.push(bbox.west, bbox.south, bbox.east, bbox.north);
    queryText += ` AND ST_Within(
      location::geometry,
      ST_MakeEnvelope($${params.length - 3}, $${params.length - 2}, $${params.length - 1}, $${params.length}, 4326)
    )`;
  }

  if (minConfidence !== undefined) {
    params.push(minConfidence);
    queryText += ` AND confidence_score >= $${params.length}`;
  }

  queryText += ' ORDER BY created_at DESC';

  const result = await query(queryText, params);

  const features = result.rows.map((row) => {
    const [lng, lat] = row.location.match(/POINT\(([^ ]+) ([^ ]+)\)/).slice(1).map(parseFloat);

    return {
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [lng, lat] as [number, number],
      },
      properties: {
        id: row.id,
        road_name: row.road_name,
        severity: row.severity,
        created_at: row.created_at.toISOString(),
        confidence_score: row.confidence_score,
        is_own_report: deviceFingerprint ? row.device_fingerprint === deviceFingerprint : false,
      },
    };
  });

  return {
    type: 'FeatureCollection',
    features,
  };
}

export async function deleteReport(reportId: string, deviceFingerprint: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM flood_reports
     WHERE id = $1 AND device_fingerprint = $2
     RETURNING id`,
    [reportId, deviceFingerprint]
  );

  if (result.rowCount === 0) {
    return false;
  }

  logger.info('Report deleted by user', { reportId, deviceFingerprint });
  return true;
}

export async function archiveExpiredReports(): Promise<number> {
  const client = await query('BEGIN');

  try {
    // Move expired reports to archive
    const result = await query(
      `INSERT INTO flood_reports_archive (id, location, road_name, severity, device_fingerprint, created_at, confidence_score)
       SELECT id, location, road_name, severity, device_fingerprint, created_at, confidence_score
       FROM flood_reports
       WHERE expires_at <= NOW()
       RETURNING id`
    );

    const archivedCount = result.rowCount || 0;

    // Delete from active reports
    await query('DELETE FROM flood_reports WHERE expires_at <= NOW()');

    // Log the action
    await query(
      `INSERT INTO audit_log (action, metadata)
       VALUES ($1, $2)`,
      ['archive_expired_reports', JSON.stringify({ count: archivedCount })]
    );

    await query('COMMIT');

    logger.info('Archived expired reports', { count: archivedCount });
    return archivedCount;
  } catch (error) {
    await query('ROLLBACK');
    logger.error('Failed to archive expired reports', error);
    throw error;
  }
}
