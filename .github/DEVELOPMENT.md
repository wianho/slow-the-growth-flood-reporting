# Development Guide

## Local Development Setup

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL with PostGIS extension
- Redis

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/wianho/slow-the-growth-flood-reporting.git
   cd slow-the-growth-flood-reporting
   ```

2. **Start Docker services**:
   ```bash
   docker compose up -d
   ```

3. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

4. **Create backend `.env` file**:
   ```bash
   cp .env.example .env
   ```

   Update with:
   ```env
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=slow_growth_flood
   DB_USER=slowgrowth
   DB_PASSWORD=dev_password_change_in_prod
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your-dev-secret-key-change-in-production
   ```

5. **Run backend migrations**:
   ```bash
   npm run migrate
   ```

6. **Start backend development server**:
   ```bash
   npm run dev
   ```

7. **Install frontend dependencies** (new terminal):
   ```bash
   cd frontend
   npm install
   ```

8. **Create frontend `.env` file**:
   ```bash
   cp .env.example .env
   ```

   Update with:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

9. **Start frontend development server**:
   ```bash
   npm run dev
   ```

10. **Access the application**:
    - Frontend: http://localhost:5173
    - Backend API: http://localhost:3000/api

## Project Structure

```
slow-the-growth-flood-reporting/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── middleware/     # Auth, rate limiting, validation
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Database, Redis, external APIs
│   │   └── utils/          # Constants, geo helpers, logger
│   ├── migrations/         # SQL migration files
│   └── package.json
├── frontend/               # React + Vite PWA
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API client
│   │   ├── store/         # Zustand state management
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Constants, validation
│   └── package.json
├── docker-compose.yml      # Local development
├── docker-compose.prod.yml # Production deployment
└── README.md
```

## Tech Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL 15 with PostGIS
- **Cache**: Redis 7
- **Authentication**: JWT with device fingerprinting
- **Logging**: Winston

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Maps**: Leaflet
- **PWA**: Vite PWA plugin

## Development Commands

### Backend

```bash
# Development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Run migrations
npm run migrate

# Lint code
npm run lint
```

### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Key Features

### Authentication
- Device fingerprint-based anonymous authentication
- JWT tokens stored in localStorage
- Automatic token refresh

### Rate Limiting
- 3 reports per device per day
- Rate limit counter stored in Redis
- Resets at midnight EST

### Location Verification
- GPS-based location verification
- Restricted to Volusia County coordinates
- Bounding box: `-81.5, 28.7` to `-80.7, 29.3`

### Report Management
- UUID-based report IDs
- Automatic expiration (every Wednesday at 5am EST)
- Confidence scoring based on nearby reports
- Users can delete their own reports

### Data Integration
- NOAA weather alerts
- USGS stream gauge data
- Volusia County GIS layers

## Testing

### Manual Testing Checklist

- [ ] Submit a flood report
- [ ] View reports on the map
- [ ] Delete your own report
- [ ] Try to submit more than 3 reports in a day
- [ ] Try to report from outside Volusia County
- [ ] Check NOAA alerts display
- [ ] Check USGS gauge data display
- [ ] Test PWA installation
- [ ] Test offline functionality

## Common Issues

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database connection failed
```bash
# Restart PostgreSQL container
docker compose restart postgres

# Check if PostGIS is installed
docker exec -it slow-the-growth-postgres-1 psql -U slowgrowth -d slow_growth_flood -c "SELECT PostGIS_version();"
```

### Redis connection failed
```bash
# Restart Redis container
docker compose restart redis

# Check Redis status
docker exec -it slow-the-growth-redis-1 redis-cli ping
```

### Frontend build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```
