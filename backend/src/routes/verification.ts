import { Router, Request, Response } from 'express';
import { isPointInBounds, isPointInReportingArea } from '../utils/geo';
import { generateToken } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

router.post('/verify-location', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, deviceFingerprint } = req.body;

    // Validate input
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !deviceFingerprint
    ) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'latitude, longitude, and deviceFingerprint are required',
      });
    }

    // Check if location is within Florida (broader check)
    const floridaBounds = {
      north: 31.0,
      south: 24.5,
      east: -80.0,
      west: -87.6,
    };

    if (!isPointInBounds(latitude, longitude, floridaBounds)) {
      return res.status(400).json({
        error: 'Location verification failed',
        details: 'Location must be within Florida',
      });
    }

    // Generate JWT token
    const token = generateToken(deviceFingerprint);

    // Check if location is within any reporting county (Volusia, Palm Beach, etc.)
    const inReportingArea = isPointInReportingArea(latitude, longitude);

    logger.info('Location verified', {
      deviceFingerprint: deviceFingerprint.substring(0, 8) + '...',
      inReportingArea,
    });

    res.json({
      verified: true,
      inVolusia: inReportingArea, // Keep 'inVolusia' key for backwards compatibility
      token,
      expiresIn: '24h',
    });
  } catch (error) {
    logger.error('Location verification error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
