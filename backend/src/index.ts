// Load environment variables FIRST - before any other imports!
import dotenv from 'dotenv';
dotenv.config();

// Now import everything else
import express from 'express';
import cors from 'cors';
import { connectRedis } from './services/redis';
import { startWeeklyRotation } from './jobs/weeklyRotation';
import reportsRouter from './routes/reports';
import dataRouter from './routes/data';
import verificationRouter from './routes/verification';
import adminRouter from './routes/admin';
import logger from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Routes
app.use('/api/reports', reportsRouter);
app.use('/api/data', dataRouter);
app.use('/api/admin', adminRouter);
app.use('/api', verificationRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
async function start() {
  try {
    // Connect to Redis
    await connectRedis();
    logger.info('Connected to Redis');

    // Start weekly rotation job
    startWeeklyRotation();

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
