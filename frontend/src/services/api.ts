import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import type { GeoJSONFeatureCollection, ReportSubmission, USGSGauge, NOAAAlert } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function verifyLocation(
  latitude: number,
  longitude: number,
  deviceFingerprint: string
) {
  const response = await api.post('/verify-location', {
    latitude,
    longitude,
    deviceFingerprint,
  });
  return response.data;
}

export async function submitReport(report: ReportSubmission) {
  const response = await api.post('/reports', report);
  return response.data;
}

export async function getReports(bbox?: {
  north: number;
  south: number;
  east: number;
  west: number;
}): Promise<GeoJSONFeatureCollection> {
  const params = bbox
    ? {
        north: bbox.north,
        south: bbox.south,
        east: bbox.east,
        west: bbox.west,
      }
    : {};

  const response = await api.get('/reports', { params });
  return response.data;
}

export async function getNOAAAlerts(): Promise<NOAAAlert[]> {
  const response = await api.get('/data/noaa');
  return response.data.alerts;
}

export async function getUSGSGauges(): Promise<USGSGauge[]> {
  const response = await api.get('/data/usgs');
  return response.data.gauges;
}

export default api;
