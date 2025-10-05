import { Pool } from 'pg';
import logger from '../utils/logger';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'volusia_flood',
  user: process.env.DB_USER || 'floodwatch',
  password: process.env.DB_PASSWORD || 'dev_password_change_in_prod',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error', { text, error });
    throw error;
  }
}

export async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // @ts-ignore
  client.query = (...args: any[]) => {
    const start = Date.now();
    return originalQuery(...args).then((res: any) => {
      const duration = Date.now() - start;
      logger.debug('Executed query', { duration, rows: res.rowCount });
      return res;
    });
  };

  // @ts-ignore
  client.release = () => {
    // @ts-ignore
    client.query = originalQuery;
    // @ts-ignore
    client.release = originalRelease;
    return originalRelease();
  };

  return client;
}

export default pool;
