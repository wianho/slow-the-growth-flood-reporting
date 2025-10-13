#!/bin/bash
set -e

# Deployment script with rollback support
# Usage: ./deploy.sh [--rollback]

DEPLOY_DIR="/home/slowgrowth/flood-reporting"
BACKUP_DIR="/home/slowgrowth/backups"
DATE=$(date +%Y%m%d_%H%M%S)

if [ "$1" = "--rollback" ]; then
  echo "🔄 Rolling back to previous deployment..."

  # Find the most recent backup
  LATEST_BACKUP=$(ls -t $BACKUP_DIR/deployment_*.tar.gz 2>/dev/null | head -1)

  if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found to rollback to!"
    exit 1
  fi

  echo "📦 Restoring from: $LATEST_BACKUP"

  # Stop services
  cd $DEPLOY_DIR
  docker compose -f docker-compose.prod.yml down

  # Restore code
  tar -xzf $LATEST_BACKUP -C /tmp/
  rsync -av --delete /tmp/flood-reporting/ $DEPLOY_DIR/

  # Restart services
  docker compose -f docker-compose.prod.yml up -d

  echo "✅ Rollback complete!"
  exit 0
fi

echo "🚀 Starting deployment..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup current deployment
echo "📦 Creating backup..."
cd /home/slowgrowth
tar -czf $BACKUP_DIR/deployment_$DATE.tar.gz flood-reporting/ \
  --exclude='flood-reporting/node_modules' \
  --exclude='flood-reporting/.git' \
  --exclude='flood-reporting/backend/node_modules' \
  --exclude='flood-reporting/frontend/node_modules'

# Backup database
echo "💾 Backing up database..."
docker compose -f $DEPLOY_DIR/docker-compose.prod.yml exec -T postgres \
  pg_dump -U slowgrowth slow_growth_flood | \
  gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 5 backups
echo "🧹 Cleaning old backups..."
ls -t $BACKUP_DIR/deployment_*.tar.gz | tail -n +6 | xargs -r rm
ls -t $BACKUP_DIR/db_backup_*.sql.gz | tail -n +6 | xargs -r rm

# Pull latest code
echo "⬇️  Pulling latest code..."
cd $DEPLOY_DIR
git pull origin main

# Build and deploy
echo "🔨 Building containers..."
docker compose -f docker-compose.prod.yml build

echo "🔄 Restarting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Health check
echo "🏥 Running health check..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
  echo "✅ Backend is healthy"
else
  echo "❌ Backend health check failed!"
  echo "🔄 Rolling back..."
  $0 --rollback
  exit 1
fi

# Clean up old Docker images
echo "🧹 Cleaning up Docker..."
docker system prune -f

echo "✅ Deployment complete!"
echo ""
echo "📊 View logs: docker compose -f docker-compose.prod.yml logs -f"
echo "🔄 Rollback: $0 --rollback"
