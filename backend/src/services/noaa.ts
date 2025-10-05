import axios from 'axios';
import { NOAAAlert } from '../types';
import { VOLUSIA_NWS_ZONES, CACHE_TTL } from '../utils/constants';
import logger from '../utils/logger';
import redisClient from './redis';

const NOAA_API_BASE = process.env.NOAA_API_BASE || 'https://api.weather.gov';

export async function getActiveAlerts(): Promise<NOAAAlert[]> {
  const cacheKey = 'noaa:alerts';

  try {
    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from NOAA API
    const zones = VOLUSIA_NWS_ZONES.join(',');
    const url = `${NOAA_API_BASE}/alerts/active?zone=${zones}`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'VolusiaFloodWatch/1.0',
      },
      timeout: 10000,
    });

    const alerts: NOAAAlert[] = response.data.features
      .filter((feature: any) => {
        const event = feature.properties.event.toLowerCase();
        return event.includes('flood') || event.includes('rain') || event.includes('storm');
      })
      .map((feature: any) => ({
        id: feature.properties.id,
        event: feature.properties.event,
        headline: feature.properties.headline,
        description: feature.properties.description,
        severity: feature.properties.severity,
        urgency: feature.properties.urgency,
        onset: new Date(feature.properties.onset),
        expires: new Date(feature.properties.expires),
        areaDesc: feature.properties.areaDesc,
      }));

    // Cache results
    await redisClient.setEx(cacheKey, CACHE_TTL.NOAA, JSON.stringify(alerts));

    return alerts;
  } catch (error) {
    logger.error('Error fetching NOAA alerts', error);
    return [];
  }
}
