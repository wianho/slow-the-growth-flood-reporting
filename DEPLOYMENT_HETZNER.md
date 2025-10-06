# Hetzner Deployment Guide

This guide walks you through deploying **Slow the Growth** flood reporting system on Hetzner Cloud - a cost-effective alternative to AWS.

## Architecture Overview

```
User → Hetzner Load Balancer → Docker Swarm/Compose
                                  ├── Frontend (Nginx)
                                  ├── Backend (Node.js)
                                  ├── PostgreSQL + PostGIS
                                  └── Redis
```

## Cost Estimate

| Service | Specification | Monthly Cost (EUR) | Monthly Cost (USD) |
|---------|--------------|-------------------|-------------------|
| **Option 1: Single Server** | CPX21 (3 vCPU, 4GB RAM, 80GB NVMe) | €7.59 | ~$8.50 |
| **Option 2: Production** | CPX31 (4 vCPU, 8GB RAM, 160GB NVMe) | €14.28 | ~$16 |
| **Option 3: High Availability** | 2x CPX31 + Load Balancer | €34.85 | ~$39 |
| Backups (20% of server cost) | Automated daily backups | +20% | +20% |
| Volume (Optional) | 100GB for database | €5.00 | ~$5.50 |

**Recommended**: CPX31 with backups = **~$19/month** (vs AWS $46-346/month!)

## Prerequisites

- Hetzner Cloud account
- Local SSH key (`ssh-keygen -t ed25519`)
- Domain name (optional, can use IP initially)
- Docker and Docker Compose knowledge

## Step 1: Create Hetzner Server

### 1.1 Via Hetzner Console

1. Login to [console.hetzner.cloud](https://console.hetzner.cloud)
2. Create new project: "slow-the-growth"
3. Add server:
   - **Location**: Ashburn, VA (closest to Florida)
   - **Image**: Ubuntu 24.04
   - **Type**: CPX31 (4 vCPU, 8GB RAM)
   - **Volume**: Optional 100GB
   - **Networking**: IPv4 + IPv6
   - **SSH Key**: Add your public key
   - **Backups**: Enable
   - **Name**: slow-growth-prod

### 1.2 Via Hetzner CLI (hcloud)

```bash
# Install CLI
brew install hcloud  # macOS
# or: wget https://github.com/hetznercloud/cli/releases/download/v1.42.0/hcloud-linux-amd64.tar.gz

# Configure
hcloud context create slow-growth
# Paste API token from Hetzner Console

# Create server
hcloud server create \
  --name slow-growth-prod \
  --type cpx31 \
  --image ubuntu-24.04 \
  --location ash \
  --ssh-key ~/.ssh/id_ed25519.pub

# Get IP
hcloud server ip slow-growth-prod
```

## Step 2: Initial Server Setup

### 2.1 Connect and Update

```bash
# SSH to server
ssh root@<SERVER_IP>

# Update system
apt update && apt upgrade -y

# Install essentials
apt install -y curl git vim ufw fail2ban
```

### 2.2 Firewall Setup

```bash
# Configure UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable

# Verify
ufw status
```

### 2.3 Create Non-Root User

```bash
# Create user
adduser slowgrowth
usermod -aG sudo slowgrowth

# Copy SSH key
mkdir -p /home/slowgrowth/.ssh
cp /root/.ssh/authorized_keys /home/slowgrowth/.ssh/
chown -R slowgrowth:slowgrowth /home/slowgrowth/.ssh
chmod 700 /home/slowgrowth/.ssh
chmod 600 /home/slowgrowth/.ssh/authorized_keys

# Test login (new terminal)
ssh slowgrowth@<SERVER_IP>
```

## Step 3: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add user to docker group
usermod -aG docker slowgrowth

# Install Docker Compose
apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

## Step 4: Deploy Application

### 4.1 Clone Repository

```bash
# As slowgrowth user
cd /home/slowgrowth
git clone https://github.com/slow-the-growth/flood-reporting.git
cd flood-reporting
```

### 4.2 Configure Environment

```bash
# Copy environment file
cp backend/.env.example backend/.env

# Edit with production values
nano backend/.env
```

**Production `.env` values:**
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=slow_growth_flood
DB_USER=slowgrowth
DB_PASSWORD=<GENERATE_STRONG_PASSWORD>
REDIS_URL=redis://redis:6379
PORT=3001
NODE_ENV=production
JWT_SECRET=<GENERATE_STRONG_SECRET>
NOAA_API_BASE=https://api.weather.gov
USGS_API_BASE=https://waterservices.usgs.gov
VOLUSIA_GIS_URL=https://maps.vcgov.org/arcgis/rest/services
ROTATION_DAY=3
ROTATION_HOUR=5
ROTATION_TZ=America/New_York
REPORTS_PER_DEVICE_PER_DAY=3
```

**Generate secrets:**
```bash
# JWT Secret
openssl rand -hex 32

# Database Password
openssl rand -base64 32
```

### 4.3 Update Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_DB: slow_growth_flood
      POSTGRES_USER: slowgrowth
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    networks:
      - app-network

  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: slow_growth_flood
      DB_USER: slowgrowth
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_URL: redis://redis:6379
      PORT: 3001
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: https://api.slowthegrowth.org/api
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 4.4 Create Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Frontend
    server {
        listen 80;
        server_name slowthegrowth.org www.slowthegrowth.org;

        location / {
            proxy_pass http://frontend:80;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # Backend API
    server {
        listen 80;
        server_name api.slowthegrowth.org;

        location / {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://backend:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Step 5: SSL/TLS with Let's Encrypt

### 5.1 Install Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 5.2 Obtain Certificates

```bash
# Stop nginx temporarily
docker compose -f docker-compose.prod.yml down nginx

# Get certificates
certbot certonly --standalone -d slowthegrowth.org -d www.slowthegrowth.org -d api.slowthegrowth.org

# Certificates saved to: /etc/letsencrypt/live/slowthegrowth.org/
```

### 5.3 Update Nginx for SSL

Update `nginx.conf`:

```nginx
    # HTTP -> HTTPS redirect
    server {
        listen 80;
        server_name slowthegrowth.org www.slowthegrowth.org api.slowthegrowth.org;
        return 301 https://$server_name$request_uri;
    }

    # Frontend HTTPS
    server {
        listen 443 ssl http2;
        server_name slowthegrowth.org www.slowthegrowth.org;

        ssl_certificate /etc/letsencrypt/live/slowthegrowth.org/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/slowthegrowth.org/privkey.pem;

        location / {
            proxy_pass http://frontend:80;
            # ... (same proxy settings)
        }
    }

    # API HTTPS
    server {
        listen 443 ssl http2;
        server_name api.slowthegrowth.org;

        ssl_certificate /etc/letsencrypt/live/slowthegrowth.org/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/slowthegrowth.org/privkey.pem;

        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend:3001;
            # ... (same proxy settings)
        }
    }
```

Update `docker-compose.prod.yml` nginx volumes:

```yaml
  nginx:
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 5.4 Auto-Renewal

```bash
# Test renewal
certbot renew --dry-run

# Add cron job
crontab -e

# Add line:
0 3 * * * certbot renew --quiet && docker compose -f /home/slowgrowth/flood-reporting/docker-compose.prod.yml restart nginx
```

## Step 6: Build and Deploy

### 6.1 Run Database Migrations

```bash
cd /home/slowgrowth/flood-reporting

# Start only PostgreSQL first
docker compose -f docker-compose.prod.yml up -d postgres

# Wait for PostgreSQL to be ready
sleep 10

# Run migrations
docker compose -f docker-compose.prod.yml exec postgres psql -U slowgrowth -d slow_growth_flood -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Copy and run migration files
docker cp backend/migrations/001_initial_schema.sql slow-growth-prod_postgres_1:/tmp/
docker compose -f docker-compose.prod.yml exec postgres psql -U slowgrowth -d slow_growth_flood -f /tmp/001_initial_schema.sql

docker cp backend/migrations/002_indexes.sql slow-growth-prod_postgres_1:/tmp/
docker compose -f docker-compose.prod.yml exec postgres psql -U slowgrowth -d slow_growth_flood -f /tmp/002_indexes.sql
```

### 6.2 Build and Start All Services

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

## Step 7: DNS Configuration

Point your domain to Hetzner server:

```
A     slowthegrowth.org       <SERVER_IP>
A     www.slowthegrowth.org   <SERVER_IP>
A     api.slowthegrowth.org   <SERVER_IP>
AAAA  slowthegrowth.org       <SERVER_IPv6>
AAAA  www.slowthegrowth.org   <SERVER_IPv6>
AAAA  api.slowthegrowth.org   <SERVER_IPv6>
```

## Step 8: Monitoring & Maintenance

### 8.1 Install Monitoring

```bash
# Install netdata (system monitoring)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access at: http://<SERVER_IP>:19999
```

### 8.2 Automated Backups

Create backup script `/home/slowgrowth/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/slowgrowth/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker compose -f /home/slowgrowth/flood-reporting/docker-compose.prod.yml exec -T postgres pg_dump -U slowgrowth slow_growth_flood | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Make executable and schedule:

```bash
chmod +x /home/slowgrowth/backup.sh

# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/slowgrowth/backup.sh >> /var/log/backup.log 2>&1
```

### 8.3 Log Rotation

```bash
# Docker logs can grow large
# Add to /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
systemctl restart docker
```

### 8.4 Updates

```bash
# Create update script
cat > /home/slowgrowth/update.sh << 'EOF'
#!/bin/bash
cd /home/slowgrowth/flood-reporting
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker system prune -f
EOF

chmod +x /home/slowgrowth/update.sh
```

## Step 9: Testing

```bash
# Health check
curl https://api.slowthegrowth.org/health

# Frontend
curl https://slowthegrowth.org

# Check Docker logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
```

## Optional: High Availability Setup

### Load Balancer Configuration

```bash
# Create Hetzner Load Balancer
hcloud load-balancer create \
  --name slow-growth-lb \
  --type lb11 \
  --location ash

# Add servers
hcloud load-balancer add-target slow-growth-lb \
  --server slow-growth-prod-1

hcloud load-balancer add-target slow-growth-lb \
  --server slow-growth-prod-2
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs <service>

# Rebuild
docker compose -f docker-compose.prod.yml build --no-cache <service>
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Check credentials
docker compose -f docker-compose.prod.yml exec postgres psql -U slowgrowth -d slow_growth_flood -c "\dt"
```

### SSL Certificate Issues
```bash
# Check certificates
certbot certificates

# Force renewal
certbot renew --force-renewal
```

## Security Hardening

### 8.1 Fail2ban for SSH

```bash
# Already installed, configure
nano /etc/fail2ban/jail.local

[sshd]
enabled = true
maxretry = 3
bantime = 3600

systemctl restart fail2ban
```

### 8.2 Automatic Security Updates

```bash
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

### 8.3 Database Security

```bash
# Disable remote PostgreSQL access (only Docker network)
# Already configured in docker-compose (no exposed ports)

# Regular password rotation (every 90 days)
# Update .env and restart services
```

## Cost Optimization

1. **Start with CPX21** ($8.50/month) and upgrade if needed
2. **Use Hetzner Volumes** for database ($5/100GB) instead of larger server
3. **Enable Backups** (20% extra) - cheaper than data loss!
4. **Use Cloudflare** (free) for CDN and DDoS protection
5. **Monitor with netdata** - optimize resource usage

## Comparison: Hetzner vs AWS

| Aspect | Hetzner | AWS |
|--------|---------|-----|
| **Cost** | $19/month | $46-346/month |
| **Setup Complexity** | Medium | High |
| **Performance** | Excellent (NVMe SSD) | Good |
| **Scalability** | Manual (easy) | Auto (complex) |
| **Support** | Email | Premium ($100+/month) |
| **Data Center** | Ashburn, VA | Multiple US regions |

## Next Steps

1. ✅ Server created and configured
2. ✅ Docker deployed
3. ✅ SSL configured
4. ✅ Backups automated
5. ⬜ Configure monitoring alerts
6. ⬜ Set up CI/CD with GitHub Actions
7. ⬜ Configure Cloudflare CDN

---

**Hetzner Deployment**: Fast, affordable, reliable! 🚀

**Support**: Open issue on GitHub or contact team.
