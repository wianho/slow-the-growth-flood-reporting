# Deployment Guide

## Production Deployment

The application is currently deployed at **https://stgfloods386.from-fl.com**

### Server Setup

1. **Server**: Hetzner Cloud VPS
2. **OS**: Ubuntu/Debian
3. **SSH Access**: `root@YOUR_SERVER_IP`

### Deployment Process

1. **Sync code to production server**:
   ```bash
   # Sync backend changes
   rsync -avz backend/src/ root@YOUR_SERVER_IP:/root/slow-the-growth/backend/src/

   # Sync frontend changes
   rsync -avz frontend/src/ root@YOUR_SERVER_IP:/root/slow-the-growth/frontend/src/
   ```

2. **Rebuild and restart containers**:
   ```bash
   ssh root@YOUR_SERVER_IP "cd /root/slow-the-growth && \
     docker compose -f docker-compose.prod.yml build --no-cache backend frontend && \
     docker compose -f docker-compose.prod.yml up -d backend frontend"
   ```

3. **Full deployment (all services)**:
   ```bash
   ssh root@YOUR_SERVER_IP "cd /root/slow-the-growth && \
     docker compose -f docker-compose.prod.yml up -d --build"
   ```

### Environment Configuration

Production environment variables are stored in `/root/slow-the-growth/.env` on the server:

```env
# Database
POSTGRES_DB=slow_growth_flood
POSTGRES_USER=slowgrowth
POSTGRES_PASSWORD=<production_password>

# Backend
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=slow_growth_flood
DB_USER=slowgrowth
DB_PASSWORD=<production_password>
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=<production_jwt_secret>

# Frontend
VITE_API_BASE_URL=https://stgfloods386.from-fl.com/api
```

### Database Management

**Connect to production database**:
```bash
ssh root@YOUR_SERVER_IP "docker exec -i slow-the-growth-postgres-1 \
  psql -U slowgrowth -d slow_growth_flood"
```

**Clear all flood reports**:
```bash
ssh root@YOUR_SERVER_IP "docker exec -i slow-the-growth-postgres-1 \
  psql -U slowgrowth -d slow_growth_flood \
  -c 'DELETE FROM flood_reports; SELECT COUNT(*) FROM flood_reports;'"
```

**Run database migrations**:
```bash
ssh root@YOUR_SERVER_IP "docker exec -i slow-the-growth-postgres-1 \
  psql -U slowgrowth -d slow_growth_flood < /docker-entrypoint-initdb.d/001_init.sql"
```

### Logs

**View backend logs**:
```bash
ssh root@YOUR_SERVER_IP "docker logs slow-the-growth-backend-1 --tail 100 -f"
```

**View nginx logs**:
```bash
ssh root@YOUR_SERVER_IP "docker logs slow-the-growth-frontend-1 --tail 100 -f"
```

**View all service logs**:
```bash
ssh root@YOUR_SERVER_IP "cd /root/slow-the-growth && \
  docker compose -f docker-compose.prod.yml logs -f"
```

### SSL/HTTPS

The production server uses nginx as a reverse proxy with SSL certificates. SSL configuration is handled at the server level.

### Troubleshooting

**Browser showing old code after deployment**:
- Users need to hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
- This clears the cached JavaScript bundle

**Database connection issues**:
```bash
# Check if postgres is running
ssh root@YOUR_SERVER_IP "docker ps | grep postgres"

# Restart postgres
ssh root@YOUR_SERVER_IP "cd /root/slow-the-growth && \
  docker compose -f docker-compose.prod.yml restart postgres"
```

**Backend not responding**:
```bash
# Check backend status
ssh root@YOUR_SERVER_IP "docker ps | grep backend"

# Rebuild backend
ssh root@YOUR_SERVER_IP "cd /root/slow-the-growth && \
  docker compose -f docker-compose.prod.yml build --no-cache backend && \
  docker compose -f docker-compose.prod.yml up -d backend"
```
