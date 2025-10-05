import axios from 'axios';
import { USGSGaugeData } from '../types';
import { VOLUSIA_USGS_GAUGES, CACHE_TTL } from '../utils/constants';
import logger from '../utils/logger';
import redisClient from './redis';

const USGS_API_BASE = process.env.USGS_API_BASE || 'https://waterservices.usgs.gov';

export async function getGaugeData(): Promise<USGSGaugeData[]> {
  const cacheKey = 'usgs:gauges';

  try {
    // Check cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from USGS API
    const sites = VOLUSIA_USGS_GAUGES.join(',');
    const url = `${USGS_API_BASE}/nwis/iv/?format=json&sites=${sites}&parameterCd=00065&siteStatus=active`;

    const response = await axios.get(url, {
      timeout: 10000,
    });

    const gauges: USGSGaugeData[] = [];

    if (response.data.value?.timeSeries) {
      for (const series of response.data.value.timeSeries) {
        const site = series.sourceInfo;
        const values = series.values[0]?.value;

        if (values && values.length > 0) {
          const latestValue = values[values.length - 1];

          gauges.push({
            siteCode: site.siteCode[0].value,
            siteName: site.siteName,
            latitude: parseFloat(site.geoLocation.geogLocation.latitude),
            longitude: parseFloat(site.geoLocation.geogLocation.longitude),
            waterLevel: parseFloat(latestValue.value),
            timestamp: new Date(latestValue.dateTime),
          });
        }
      }
    }

    // Cache results
    await redisClient.setEx(cacheKey, CACHE_TTL.USGS, JSON.stringify(gauges));

    return gauges;
  } catch (error) {
    logger.error('Error fetching USGS gauge data', error);
    return [];
  }
}
