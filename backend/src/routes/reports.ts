import { Router, Response } from 'express';
import { createReport, getActiveReports, deleteReport } from '../models/FloodReport';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { validateLocation, validateSeverity } from '../middleware/validation';
import { incrementRateLimit, checkRateLimit } from '../services/rateLimit';
import logger from '../utils/logger';

const router = Router();

// Submit a flood report
router.post(
  '/',
  verifyToken,
  validateLocation,
  validateSeverity,
  rateLimitMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { latitude, longitude, road_name, severity } = req.body;

      if (!req.deviceFingerprint) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Create the report
      const report = await createReport({
        latitude,
        longitude,
        road_name,
        severity,
        device_fingerprint: req.deviceFingerprint,
      });

      // Increment rate limit counter
      await incrementRateLimit(req.deviceFingerprint);

      // Get updated rate limit info
      const rateLimitInfo = await checkRateLimit(req.deviceFingerprint);

      logger.info('Report created', {
        reportId: report.id,
        severity,
        confidenceScore: report.confidence_score,
      });

      res.status(201).json({
        report: {
          id: report.id,
          location: report.location,
          road_name: report.road_name,
          severity: report.severity,
          created_at: report.created_at,
          expires_at: report.expires_at,
          confidence_score: report.confidence_score,
        },
        rateLimit: {
          remaining: rateLimitInfo.remaining,
          resetAt: rateLimitInfo.resetAt,
        },
      });
    } catch (error) {
      logger.error('Error creating report', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get active flood reports
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { north, south, east, west, minConfidence } = req.query;

    let bbox;
    if (north && south && east && west) {
      bbox = {
        north: parseFloat(north as string),
        south: parseFloat(south as string),
        east: parseFloat(east as string),
        west: parseFloat(west as string),
      };
    }

    const minConf = minConfidence ? parseInt(minConfidence as string, 10) : undefined;

    const reports = await getActiveReports(bbox, minConf, req.deviceFingerprint);

    res.json(reports);
  } catch (error) {
    logger.error('Error fetching reports', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a flood report
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const reportId = parseInt(req.params.id, 10);

    if (!req.deviceFingerprint) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (isNaN(reportId)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }

    const deleted = await deleteReport(reportId, req.deviceFingerprint);

    if (!deleted) {
      return res.status(404).json({ error: 'Report not found or not authorized' });
    }

    logger.info('Report deleted', { reportId, deviceFingerprint: req.deviceFingerprint });
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    logger.error('Error deleting report', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
