import { Router, Request, Response } from 'express';
import { getVolusiaZoning, getZoningAtPoint, ZONING_TYPES } from '../services/volusiaGIS';
import logger from '../utils/logger';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for GIS endpoints (more generous than report submission)
const gisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: 'Too many GIS requests, please try again later',
});

router.use(gisLimiter);

/**
 * GET /api/gis/zoning
 * Fetch zoning data for a bounding box
 *
 * Query params:
 * - north: northern boundary (latitude)
 * - south: southern boundary (latitude)
 * - east: eastern boundary (longitude)
 * - west: western boundary (longitude)
 * - types: comma-separated zoning type codes (optional, e.g., "COM,IND")
 */
router.get('/zoning', async (req: Request, res: Response) => {
  try {
    const { north, south, east, west, types } = req.query;

    // Validate bounding box
    let bbox: { west: number; south: number; east: number; north: number } | undefined;

    if (north && south && east && west) {
      bbox = {
        north: parseFloat(north as string),
        south: parseFloat(south as string),
        east: parseFloat(east as string),
        west: parseFloat(west as string),
      };

      // Basic validation
      if (
        isNaN(bbox.north) || isNaN(bbox.south) ||
        isNaN(bbox.east) || isNaN(bbox.west) ||
        bbox.north <= bbox.south || bbox.east <= bbox.west
      ) {
        return res.status(400).json({
          error: 'Invalid bounding box',
          details: 'Bounding box coordinates must be valid numbers with north > south and east > west',
        });
      }
    }

    // Parse zoning types filter
    let zoningTypes: string[] | undefined;
    if (types) {
      zoningTypes = (types as string).split(',').map(t => t.trim().toUpperCase());
    }

    logger.info('Fetching zoning data', {
      bbox,
      zoningTypes,
      ip: req.ip,
    });

    const zoningData = await getVolusiaZoning(bbox, zoningTypes);

    res.json({
      type: 'FeatureCollection',
      features: zoningData.features,
      metadata: {
        count: zoningData.features.length,
        bbox,
        types: zoningTypes,
        source: 'Volusia County GIS',
        sourceUrl: 'https://maps1.vcgov.org/arcgis/rest/services/CountywideZoning/MapServer',
      },
    });
  } catch (error: any) {
    logger.error('Error fetching zoning data', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: 'Failed to fetch zoning data',
      details: error.message,
    });
  }
});

/**
 * GET /api/gis/zoning/point
 * Get zoning information for a specific point
 *
 * Query params:
 * - lat: latitude
 * - lng: longitude
 */
router.get('/zoning/point', async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing coordinates',
        details: 'Both lat and lng query parameters are required',
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        details: 'Latitude and longitude must be valid numbers',
      });
    }

    const zoning = await getZoningAtPoint(latitude, longitude);

    if (!zoning) {
      return res.json({
        found: false,
        message: 'No zoning information found at this location',
      });
    }

    res.json({
      found: true,
      zoning: zoning.properties,
      geometry: zoning.geometry,
    });
  } catch (error: any) {
    logger.error('Error fetching zoning at point', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      error: 'Failed to fetch zoning information',
      details: error.message,
    });
  }
});

/**
 * GET /api/gis/zoning/types
 * Get available zoning types with their colors and descriptions
 */
router.get('/zoning/types', (req: Request, res: Response) => {
  res.json({
    types: ZONING_TYPES,
  });
});

export default router;
