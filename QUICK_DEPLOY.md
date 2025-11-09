# Quick Deploy Guide

> Fast deployment to production server - from anywhere!

## Prerequisites

- SSH access to production server
- Git changes committed and pushed to GitHub
- Docker running on production server

## Production Server Details

- **Server**: root@178.156.151.63 (Hetzner)
- **Location**: /root/slow-the-growth
- **Domain**: https://stgfloods386.from-fl.com
- **GitHub**: https://github.com/wianho/slow-the-growth-flood-reporting

## One-Line Deploy

Deploy everything (frontend, backend, all services):

```bash
ssh root@178.156.151.63 "cd /root/slow-the-growth && git pull && docker compose -f docker-compose.prod.yml build && docker compose -f docker-compose.prod.yml up -d"
```

## Selective Service Deploy

Deploy only specific services:

### Frontend Only
```bash
ssh root@178.156.151.63 "cd /root/slow-the-growth && git pull && docker compose -f docker-compose.prod.yml build frontend && docker compose -f docker-compose.prod.yml up -d"
```

### Backend Only
```bash
ssh root@178.156.151.63 "cd /root/slow-the-growth && git pull && docker compose -f docker-compose.prod.yml build backend && docker compose -f docker-compose.prod.yml up -d"
```

### Both Frontend & Backend
```bash
ssh root@178.156.151.63 "cd /root/slow-the-growth && git pull && docker compose -f docker-compose.prod.yml build frontend backend && docker compose -f docker-compose.prod.yml up -d"
```

## Pre-Deployment Checklist

1. **Commit and push changes to GitHub**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Verify local tests pass**
   - Frontend builds without errors: `cd frontend && npm run build`
   - Backend has no TypeScript errors: `cd backend && npm run build`

3. **Run deploy command** (see above)

4. **Verify deployment**
   - Check site: https://stgfloods386.from-fl.com
   - Check logs if needed (see below)

## Post-Deployment Checks

### View Service Status
```bash
ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml ps"
```

### View Logs
```bash
# All services
ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml logs -f"

# Specific service
ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml logs -f frontend"
ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml logs -f backend"
```

### Restart Services
```bash
# All services
ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml restart"

# Specific service
ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml restart frontend"
```

## Troubleshooting

### Deployment Fails
```bash
# Check current status
ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml ps"

# Check logs for errors
ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml logs --tail=50"

# Rebuild from scratch (no cache)
ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml build --no-cache && docker compose -f docker-compose.prod.yml up -d"
```

### Git Pull Conflicts
```bash
# SSH into server
ssh root@178.156.151.63

# Navigate to project
cd /root/slow-the-growth

# Check status
git status

# If conflicts, reset to remote
git fetch origin
git reset --hard origin/main

# Then rebuild
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Disk Space Issues
```bash
# Clean up old Docker images/containers
ssh root@178.156.151.63 "docker system prune -af"

# Check disk usage
ssh root@178.156.151.63 "df -h"
```

## Environment Variables

Production environment variables are stored on the server at:
- Frontend: Built into image at build time (from .env.production)
- Backend: /root/slow-the-growth/backend/.env

To update backend environment variables:
```bash
ssh root@178.156.151.63
nano /root/slow-the-growth/backend/.env
# Make changes, then restart
docker compose -f docker-compose.prod.yml restart backend
```

## Database Operations

### Backup Database
```bash
ssh root@178.156.151.63 "docker compose -f /root/slow-the-growth/docker-compose.prod.yml exec -T postgres pg_dump -U slowgrowth slow_growth_flood | gzip > ~/backup-$(date +%Y%m%d).sql.gz"
```

### Access Database
```bash
ssh root@178.156.151.63 "docker compose -f /root/slow-the-growth/docker-compose.prod.yml exec postgres psql -U slowgrowth -d slow_growth_flood"
```

## Deployment Workflow

```mermaid
graph LR
    A[Local Changes] --> B[Git Commit]
    B --> C[Git Push]
    C --> D[SSH to Server]
    D --> E[Git Pull]
    E --> F[Docker Build]
    F --> G[Docker Up]
    G --> H[Live!]
```

## Common Commands Quick Reference

| Task | Command |
|------|---------|
| Deploy All | `ssh root@178.156.151.63 "cd /root/slow-the-growth && git pull && docker compose -f docker-compose.prod.yml build && docker compose -f docker-compose.prod.yml up -d"` |
| Deploy Frontend | `ssh root@178.156.151.63 "cd /root/slow-the-growth && git pull && docker compose -f docker-compose.prod.yml build frontend && docker compose -f docker-compose.prod.yml up -d"` |
| View Logs | `ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml logs -f"` |
| Check Status | `ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml ps"` |
| Restart All | `ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml restart"` |

## Tips for Fast Deployment

1. **Save common commands as aliases** in your `~/.zshrc` or `~/.bashrc`:
   ```bash
   alias deploy-flood='ssh root@178.156.151.63 "cd /root/slow-the-growth && git pull && docker compose -f docker-compose.prod.yml build && docker compose -f docker-compose.prod.yml up -d"'
   alias deploy-flood-frontend='ssh root@178.156.151.63 "cd /root/slow-the-growth && git pull && docker compose -f docker-compose.prod.yml build frontend && docker compose -f docker-compose.prod.yml up -d"'
   alias flood-logs='ssh root@178.156.151.63 "cd /root/slow-the-growth && docker compose -f docker-compose.prod.yml logs -f"'
   ```

2. **Use SSH keys** for passwordless authentication (you probably already do this)

3. **Check locally before deploying** - run `npm run build` in frontend and backend to catch errors early

## Need More Detail?

See [DEPLOYMENT_HETZNER.md](DEPLOYMENT_HETZNER.md) for comprehensive deployment guide including:
- Initial server setup
- SSL/TLS configuration
- Monitoring setup
- Security hardening
- Backup strategies

---

**Deploy with confidence!** 🚀
