# Development Guide

## Local Development Setup

### Prerequisites
- Node.js 20+ (currently using v24.7.0)
- Docker Desktop (for PostgreSQL and Redis)
- npm 9+

### First Time Setup

1. **Clone the repository**
   ```bash
   git clone git@github.com:wianho/slow-the-growth-flood-reporting.git
   cd slow-the-growth-flood-reporting
   ```

2. **Start Docker services**
   ```bash
   # Open Docker Desktop
   open -a Docker

   # Wait for Docker to start, then run:
   docker compose up -d
   ```

   This starts:
   - PostgreSQL (localhost:5432)
   - Redis (localhost:6379)

3. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   npm run dev
   ```

   Backend runs at: http://localhost:3001

4. **Frontend Setup** (in a new terminal tab)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Frontend runs at: http://localhost:5173

### Common Issues & Fixes

#### Issue: "Cannot find module" error when running backend
**Symptoms:**
```
Error: Cannot find module '.'
```

**Fix:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Why it happens:** Node modules can get corrupted when:
- Switching Node.js versions
- Incomplete npm install
- Architecture mismatch (especially on Apple Silicon M1/M2/M4)

#### Issue: Docker containers not starting
**Fix:**
```bash
# Make sure Docker Desktop is running
open -a Docker

# Check if containers are running
docker compose ps

# Restart containers
docker compose down
docker compose up -d
```

#### Issue: Port already in use
**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Fix:**
```bash
# Find process using the port
lsof -i :3001

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or change the port in backend/.env
PORT=3002
```

### Development Workflow

1. **Make code changes**
   - Backend changes auto-reload (ts-node-dev)
   - Frontend changes auto-reload (Vite HMR)

2. **Test locally**
   - Open http://localhost:5173
   - Check browser console for errors
   - Test location detection (allow location access)
   - Submit test reports
   - Verify map updates

3. **Check logs**
   - Backend: Check terminal running `npm run dev`
   - Docker: `docker compose logs -f`
   - PostgreSQL: `docker compose exec postgres psql -U postgres`

### Testing Changes

#### Test Location Boundaries
The app now covers all of Florida. To test:

1. **Inside Florida** (should work):
   - Miami: 25.7617° N, -80.1918° W
   - Orlando: 28.5383° N, -81.3792° W
   - Jacksonville: 30.3322° N, -81.6557° W
   - Key West: 24.5551° N, -81.7800° W
   - Pensacola: 30.4213° N, -87.2169° W
   - Wellington: 26.6617° N, -80.2683° W

2. **Outside Florida** (should fail):
   - Atlanta, GA: 33.7490° N, -84.3880° W
   - Should show: "Location must be within Florida"

#### Test Report Submission
1. Enable location services in your browser
2. Click "Report Flooding"
3. Select severity level
4. Submit report
5. Verify it appears on the map

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=slow_growth_flood
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3001
NODE_ENV=development

# JWT (generate with: openssl rand -hex 32)
JWT_SECRET=your_secret_here

# External APIs
NOAA_API_BASE=https://api.weather.gov
USGS_API_BASE=https://waterservices.usgs.gov

# Rate Limiting
REPORTS_PER_DEVICE_PER_DAY=3
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

### Database Management

#### Run migrations
```bash
docker compose exec postgres psql -U postgres -d slow_growth_flood

# In psql:
CREATE EXTENSION IF NOT EXISTS postgis;
\i /path/to/migrations/001_initial_schema.sql
\i /path/to/migrations/002_indexes.sql
```

#### Reset database
```bash
docker compose down -v  # Removes volumes
docker compose up -d
# Re-run migrations
```

#### View database
```bash
docker compose exec postgres psql -U postgres -d slow_growth_flood

# Useful commands:
\dt                    # List tables
\d reports             # Describe reports table
SELECT * FROM reports; # View all reports
```

### Code Structure

```
slow-the-growth-flood-reporting/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app entry point
│   │   ├── routes/               # API endpoints
│   │   │   ├── reports.ts        # Report submission/retrieval
│   │   │   ├── verification.ts   # Location verification
│   │   │   ├── data.ts           # NOAA/USGS integration
│   │   │   └── admin.ts          # Admin dashboard
│   │   ├── services/
│   │   │   ├── database.ts       # PostgreSQL connection
│   │   │   ├── redis.ts          # Redis connection
│   │   │   ├── rateLimit.ts      # Rate limiting logic
│   │   │   ├── noaa.ts           # NOAA API integration
│   │   │   ├── usgs.ts           # USGS API integration
│   │   │   └── gis.ts            # GIS data processing
│   │   ├── middleware/
│   │   │   ├── validation.ts     # Location/input validation
│   │   │   ├── rateLimit.ts      # Rate limit middleware
│   │   │   └── auth.ts           # JWT authentication
│   │   ├── utils/
│   │   │   ├── constants.ts      # Florida bounds, gauges, zones
│   │   │   ├── geo.ts            # Geospatial utilities
│   │   │   └── logger.ts         # Winston logging
│   │   └── jobs/
│   │       └── weeklyRotation.ts # Wednesday 5am data rotation
│   └── migrations/               # Database schema
│
└── frontend/
    ├── src/
    │   ├── App.tsx               # Main app component
    │   ├── components/
    │   │   ├── Map/
    │   │   │   ├── FloodMap.tsx  # Leaflet map component
    │   │   │   └── ReportMarker.tsx
    │   │   ├── Report/
    │   │   │   ├── ReportForm.tsx
    │   │   │   └── ReportList.tsx
    │   │   ├── Dashboard/
    │   │   │   ├── StatsPanel.tsx
    │   │   │   ├── WeatherWidget.tsx
    │   │   │   └── AlertBanner.tsx
    │   │   └── Layout/
    │   │       ├── Header.tsx
    │   │       └── Footer.tsx
    │   ├── services/
    │   │   ├── api.ts            # API client
    │   │   └── deviceFingerprint.ts
    │   ├── utils/
    │   │   ├── constants.ts      # Florida center, bounds
    │   │   └── validation.ts     # Client-side validation
    │   ├── hooks/
    │   │   ├── useFloodReports.ts
    │   │   ├── useGeolocation.ts
    │   │   └── useRateLimit.ts
    │   └── store/
    │       └── appStore.ts       # Zustand state management
    └── public/
        └── manifest.json         # PWA manifest
```

### Key Files for Location Changes

When we expanded from Volusia County to all of Florida, we modified:

**Backend:**
- `backend/src/utils/constants.ts` - Florida bounds, USGS gauges, NWS zones
- `backend/src/middleware/validation.ts` - Error messages

**Frontend:**
- `frontend/src/utils/constants.ts` - Map center and bounds
- `frontend/src/utils/validation.ts` - Location validation
- `frontend/src/components/Map/FloodMap.tsx` - Map center
- `frontend/src/components/Report/ReportForm.tsx` - Error messages

### Before Committing

1. **Test locally** - Ensure both frontend and backend run without errors
2. **Check git status** - Review all changed files
3. **Commit with clear message** - Describe what changed and why

```bash
git status
git add .
git commit -m "Expand coverage from Volusia County to all of Florida"
git push origin main
```

### Deployment

See [DEPLOYMENT_HETZNER.md](./DEPLOYMENT_HETZNER.md) for production deployment steps.

Quick deployment to VPS:
```bash
# SSH to server
ssh slowgrowth@<SERVER_IP>

# Pull latest changes
cd /home/slowgrowth/flood-reporting
git pull

# Rebuild and restart services
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

---

## Need Help?

- GitHub Issues: https://github.com/wianho/slow-the-growth-flood-reporting/issues
- Check logs: `docker compose logs -f`
- Database issues: Check PostgreSQL logs in Docker
