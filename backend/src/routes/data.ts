import { Router } from 'express';
import { getActiveAlerts } from '../services/noaa';
import { getGaugeData } from '../services/usgs';
import logger from '../utils/logger';

const router = Router();

// Get NOAA weather alerts
router.get('/noaa', async (req, res) => {
  try {
    const alerts = await getActiveAlerts();
    res.json({ alerts });
  } catch (error) {
    logger.error('Error fetching NOAA data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get USGS stream gauge data
router.get('/usgs', async (req, res) => {
  try {
    const gauges = await getGaugeData();
    res.json({ gauges });
  } catch (error) {
    logger.error('Error fetching USGS data', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
