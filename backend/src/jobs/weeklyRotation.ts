import cron from 'node-cron';
import { archiveExpiredReports } from '../models/FloodReport';
import { ROTATION_CONFIG } from '../utils/constants';
import logger from '../utils/logger';

// Cron expression for Wednesday at 5 AM EST
// Format: second minute hour day-of-month month day-of-week
// 0 5 * * 3 = At 5:00 AM, only on Wednesday
const CRON_EXPRESSION = `0 ${ROTATION_CONFIG.hour} * * ${ROTATION_CONFIG.day}`;

export function startWeeklyRotation() {
  cron.schedule(
    CRON_EXPRESSION,
    async () => {
      logger.info('Starting weekly rotation job');
      try {
        const count = await archiveExpiredReports();
        logger.info('Weekly rotation completed', { archivedReports: count });
      } catch (error) {
        logger.error('Weekly rotation failed', error);
      }
    },
    {
      timezone: ROTATION_CONFIG.timezone,
    }
  );

  logger.info('Weekly rotation job scheduled', {
    schedule: CRON_EXPRESSION,
    timezone: ROTATION_CONFIG.timezone,
  });
}
