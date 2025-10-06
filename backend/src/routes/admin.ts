import { Router, Response } from 'express';
import { verifyAdminCredentials, generateAdminToken, verifyAdminToken, AdminAuthRequest } from '../middleware/adminAuth';
import { query } from '../services/database';
import logger from '../utils/logger';

const router = Router();

// Admin login
router.post('/login', async (req, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      logger.warn('Failed admin login attempt', { username });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateAdminToken(username);
    logger.info('Admin logged in', { username });

    res.json({ token, username });
  } catch (error) {
    logger.error('Admin login error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reports (admin view)
router.get('/reports', verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT
        id,
        ST_AsText(location) as location,
        road_name,
        severity,
        device_fingerprint,
        created_at,
        expires_at,
        confidence_score
      FROM flood_reports
      ORDER BY created_at DESC`
    );

    const reports = result.rows.map((row) => {
      const [lng, lat] = row.location.match(/POINT\(([^ ]+) ([^ ]+)\)/).slice(1).map(parseFloat);
      return {
        id: row.id,
        latitude: lat,
        longitude: lng,
        road_name: row.road_name,
        severity: row.severity,
        device_fingerprint: row.device_fingerprint,
        created_at: row.created_at.toISOString(),
        expires_at: row.expires_at.toISOString(),
        confidence_score: row.confidence_score,
      };
    });

    res.json({ reports });
  } catch (error) {
    logger.error('Error fetching admin reports', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics
router.get('/stats', verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    // Total reports
    const totalResult = await query('SELECT COUNT(*) as count FROM flood_reports');
    const total = parseInt(totalResult.rows[0].count, 10);

    // Reports by severity
    const severityResult = await query(
      `SELECT severity, COUNT(*) as count
       FROM flood_reports
       GROUP BY severity`
    );
    const bySeverity = severityResult.rows.reduce((acc, row) => {
      acc[row.severity] = parseInt(row.count, 10);
      return acc;
    }, {} as Record<string, number>);

    // Reports today
    const todayResult = await query(
      `SELECT COUNT(*) as count
       FROM flood_reports
       WHERE created_at >= CURRENT_DATE`
    );
    const today = parseInt(todayResult.rows[0].count, 10);

    // Reports this week
    const weekResult = await query(
      `SELECT COUNT(*) as count
       FROM flood_reports
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'`
    );
    const thisWeek = parseInt(weekResult.rows[0].count, 10);

    res.json({
      total,
      today,
      thisWeek,
      bySeverity,
    });
  } catch (error) {
    logger.error('Error fetching admin stats', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete any report (admin privilege)
router.delete('/reports/:id', verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const reportId = req.params.id;

    const result = await query(
      `DELETE FROM flood_reports
       WHERE id = $1
       RETURNING id`,
      [reportId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    logger.info('Admin deleted report', { reportId, adminUsername: req.adminUsername });
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    logger.error('Error deleting report (admin)', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear all reports (admin privilege)
router.delete('/reports', verifyAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const result = await query('DELETE FROM flood_reports RETURNING id');
    const count = result.rowCount || 0;

    logger.warn('Admin cleared all reports', { count, adminUsername: req.adminUsername });
    res.json({ message: `Deleted ${count} reports`, count });
  } catch (error) {
    logger.error('Error clearing all reports (admin)', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
