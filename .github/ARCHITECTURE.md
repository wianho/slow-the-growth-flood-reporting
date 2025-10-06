# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          React PWA (Frontend)                        │   │
│  │  - Location Services                                 │   │
│  │  - Leaflet Maps                                      │   │
│  │  - TanStack Query                                    │   │
│  │  - Zustand Store                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx (Reverse Proxy)                   │
│  - SSL Termination                                           │
│  - Static File Serving                                       │
│  - API Proxying                                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Backend API                     │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Middleware    │  │     Routes      │                  │
│  │  - JWT Auth     │  │  - Reports      │                  │
│  │  - Rate Limit   │  │  - Data (NOAA)  │                  │
│  │  - Validation   │  │  - Verify Loc   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │     Models      │  │    Services     │                  │
│  │  - FloodReport  │  │  - Database     │                  │
│  │                 │  │  - Redis        │                  │
│  └─────────────────┘  └─────────────────┘                  │
└───────────┬──────────────────┬───────────────────────────────┘
            │                  │
            ▼                  ▼
┌────────────────────┐  ┌─────────────┐
│   PostgreSQL       │  │    Redis    │
│   + PostGIS        │  │  Cache      │
│                    │  │  - Tokens   │
│  - flood_reports   │  │  - Rates    │
│  - audit_log       │  └─────────────┘
│  - archive         │
└────────────────────┘
```

## Data Flow

### Submit Flood Report

1. User opens app → Frontend requests location permission
2. Location obtained → Frontend verifies location is in Volusia County
3. User selects severity → Frontend sends POST to `/api/reports`
4. Backend validates JWT token and device fingerprint
5. Backend checks rate limit (3 per day) in Redis
6. Backend validates location coordinates
7. Backend checks for nearby reports (within 50m in last 24h)
8. Backend creates report with confidence score
9. Backend increments rate limit counter
10. Backend returns report data with updated rate limit
11. Frontend updates map and report list

### View Reports

1. Frontend loads → Requests auth token from `/api/verify-location`
2. Frontend fetches reports from `/api/reports` with bbox
3. Backend queries PostgreSQL for active reports (not expired)
4. Backend marks user's own reports with `is_own_report` flag
5. Frontend renders markers on Leaflet map
6. Frontend displays report list with delete buttons for own reports

### Delete Report

1. User clicks delete button → Confirmation dialog
2. Frontend sends DELETE to `/api/reports/:id` with JWT
3. Backend verifies JWT and device fingerprint
4. Backend deletes report only if device_fingerprint matches
5. Frontend invalidates query cache and refreshes map

## Database Schema

### flood_reports

| Column             | Type                      | Description                    |
|--------------------|---------------------------|--------------------------------|
| id                 | UUID                      | Primary key                    |
| location           | GEOGRAPHY(Point, 4326)    | Lat/lng with spatial index     |
| severity           | VARCHAR(20)               | minor, moderate, severe        |
| device_fingerprint | VARCHAR(255)              | Anonymous user identifier      |
| created_at         | TIMESTAMPTZ               | Report creation time           |
| expires_at         | TIMESTAMPTZ               | Auto-deletion time (Wed 5am)   |
| confidence_score   | INTEGER                   | Count of nearby reports        |

### Spatial Queries

- **Nearby reports**: Uses `ST_DWithin` to find reports within 50 meters
- **Bounding box**: Uses `ST_MakeEnvelope` and `ST_Within` for map viewport
- **Location validation**: Uses `ST_Within` to check if point is in Volusia County

## Authentication & Authorization

### Device Fingerprinting

- Browser fingerprint generated from:
  - User agent
  - Screen resolution
  - Timezone
  - Language
  - Platform
- Hashed with SHA-256
- Stored in localStorage

### JWT Flow

1. User visits site → Frontend generates device fingerprint
2. Frontend sends fingerprint to `/api/verify-location`
3. Backend creates JWT with fingerprint in payload
4. JWT expires in 24 hours
5. Token included in all API requests via Authorization header

### Report Ownership

- Reports tagged with device_fingerprint
- Only matching device can delete report
- No user accounts or personal data stored

## Rate Limiting

### Implementation

- Redis key: `rate_limit:{device_fingerprint}:{YYYY-MM-DD}`
- Value: count of reports submitted today
- Expires at midnight EST
- Checked before allowing new reports

### Limits

- **Reports**: 3 per device per day
- **API requests**: No hard limit, but validated by JWT

## Caching Strategy

### Frontend (TanStack Query)

- Reports: 30 second stale time
- NOAA alerts: 5 minute stale time
- USGS gauges: 5 minute stale time
- Automatic refetch on window focus

### Backend (Redis)

- Rate limit counters
- JWT blacklist (for revocation)

## External APIs

### NOAA Weather Alerts

- Endpoint: `https://api.weather.gov/alerts/active`
- Filter: Volusia County, FL
- Refresh: Every 5 minutes
- Timeout: 10 seconds

### USGS Stream Gauges

- Endpoint: `https://waterservices.usgs.gov/nwis/iv/`
- Sites: Volusia County stream gauges
- Parameters: Water level, discharge
- Refresh: Every 5 minutes

## Security

### Input Validation

- Latitude/longitude bounds checking
- Severity enum validation
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)

### CORS

- Production: Only allow production domain
- Development: Allow localhost

### Rate Limiting

- Prevents spam and abuse
- Device-based (not IP-based for mobile users)

### Data Privacy

- No personal information collected
- No IP addresses logged
- Anonymous device fingerprints only
- Reports auto-delete weekly

## Performance

### Database Indexes

- `idx_reports_location` (GIST): Spatial queries
- `idx_reports_expires` (BTREE): Cleanup queries
- `idx_reports_created` (BTREE): Sorting
- `idx_reports_fingerprint` (BTREE): Ownership checks

### Query Optimization

- Limit results to map viewport (bounding box)
- Use spatial indexes for location queries
- Only return active (non-expired) reports

### Frontend Optimization

- Code splitting with Vite
- Lazy loading of map tiles
- Debounced API calls on map pan/zoom
- Cached static assets (PWA)
