import { Request, Response, NextFunction } from 'express';
import { isPointInReportingArea, getCountyName } from '../utils/geo';

export function validateLocation(req: Request, res: Response, next: NextFunction) {
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({
      error: 'Invalid coordinates',
      details: 'Latitude and longitude must be numbers',
    });
  }

  if (latitude < -90 || latitude > 90) {
    return res.status(400).json({
      error: 'Invalid latitude',
      details: 'Latitude must be between -90 and 90',
    });
  }

  if (longitude < -180 || longitude > 180) {
    return res.status(400).json({
      error: 'Invalid longitude',
      details: 'Longitude must be between -180 and 180',
    });
  }

  if (!isPointInReportingArea(latitude, longitude)) {
    return res.status(400).json({
      error: 'Location outside reporting area',
      details: 'Reports can only be submitted from participating counties (Volusia and Palm Beach). The map displays statewide data for public awareness.',
    });
  }

  next();
}

export function validateSeverity(req: Request, res: Response, next: NextFunction) {
  const { severity } = req.body;
  const validSeverities = ['minor', 'moderate', 'severe'];

  if (!validSeverities.includes(severity)) {
    return res.status(400).json({
      error: 'Invalid severity',
      details: `Severity must be one of: ${validSeverities.join(', ')}`,
    });
  }

  next();
}
