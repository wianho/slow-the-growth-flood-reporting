# AWS Serverless Deployment Guide

This guide walks you through deploying **Slow the Growth** flood reporting system on AWS using serverless architecture.

## Architecture Overview

```
User → CloudFront → S3 (Frontend PWA)
     ↓
API Gateway → Lambda (Backend) → RDS Aurora Serverless (PostgreSQL + PostGIS)
                                → ElastiCache Serverless (Redis)
                                → EventBridge (Cron jobs)
```

## Cost Estimate

| Service | Specification | Low Traffic | High Traffic |
|---------|--------------|-------------|--------------|
| S3 + CloudFront | Static PWA hosting | $1-3/month | $5-15/month |
| Lambda + API Gateway | Pay-per-request backend | $0-5/month | $20-50/month |
| RDS Aurora Serverless v2 | PostgreSQL with PostGIS | $30-50/month | $100-200/month |
| ElastiCache Serverless | Redis auto-scaling | $15-25/month | $40-80/month |
| EventBridge | Cron jobs (weekly rotation) | $0 (free tier) | $1/month |
| **TOTAL** | | **~$46-83/month** | **$166-346/month** |

## Prerequisites

- AWS Account with billing enabled
- AWS CLI installed and configured
- Node.js 20+ 
- Docker (for local builds)

## Step 1: Frontend Deployment (S3 + CloudFront)

### 1.1 Build the Frontend

```bash
cd frontend
npm run build
```

### 1.2 Create S3 Bucket

```bash
aws s3 mb s3://slow-growth-flood-app --region us-east-1
```

### 1.3 Configure S3 for Static Website Hosting

```bash
aws s3 website s3://slow-growth-flood-app \
  --index-document index.html \
  --error-document index.html
```

### 1.4 Upload Build Files

```bash
aws s3 sync dist/ s3://slow-growth-flood-app/ --delete
```

### 1.5 Create CloudFront Distribution

```bash
# Create distribution configuration (JSON file)
# Then: aws cloudfront create-distribution --cli-input-json file://cloudfront-config.json
```

## Step 2: Backend Deployment (Lambda)

### 2.1 Package Lambda Function

```bash
cd backend
npm run build
zip -r function.zip dist/ node_modules/
```

### 2.2 Create Lambda Function

```bash
aws lambda create-function \
  --function-name slow-growth-api \
  --runtime nodejs20.x \
  --handler dist/lambda.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::ACCOUNT_ID:role/lambda-execution-role
```

### 2.3 Create API Gateway

```bash
aws apigatewayv2 create-api \
  --name slow-growth-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:REGION:ACCOUNT_ID:function:slow-growth-api
```

## Step 3: Database (RDS Aurora Serverless)

### 3.1 Create Aurora Serverless Cluster

```bash
aws rds create-db-cluster \
  --db-cluster-identifier slow-growth-db \
  --engine aurora-postgresql \
  --engine-version 15.4 \
  --master-username slowgrowth \
  --master-user-password <STRONG_PASSWORD> \
  --database-name slow_growth_flood \
  --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=2
```

### 3.2 Enable PostGIS Extension

```sql
-- Connect to database
CREATE EXTENSION postgis;
```

### 3.3 Run Migrations

```bash
# Run migration files from backend/migrations/
psql -h <DB_ENDPOINT> -U slowgrowth -d slow_growth_flood -f 001_initial_schema.sql
psql -h <DB_ENDPOINT> -U slowgrowth -d slow_growth_flood -f 002_indexes.sql
```

## Step 4: Cache (ElastiCache Serverless)

### 4.1 Create ElastiCache Cluster

```bash
aws elasticache create-serverless-cache \
  --serverless-cache-name slow-growth-cache \
  --engine redis \
  --serverless-cache-configuration \
    DataStorage={Maximum=1,Unit=GB} \
    ECPUPerSecond={Maximum=5000}
```

## Step 5: Scheduled Jobs (EventBridge)

### 5.1 Create Weekly Rotation Rule

```bash
# Create rule for every Wednesday at 5 AM EST
aws events put-rule \
  --name slow-growth-weekly-rotation \
  --schedule-expression "cron(0 9 ? * WED *)"
```

### 5.2 Add Lambda Target

```bash
aws events put-targets \
  --rule slow-growth-weekly-rotation \
  --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT_ID:function:slow-growth-rotation"
```

## Step 6: Environment Variables

Update Lambda environment variables:

```bash
aws lambda update-function-configuration \
  --function-name slow-growth-api \
  --environment Variables="{
    DB_HOST=<RDS_ENDPOINT>,
    DB_NAME=slow_growth_flood,
    DB_USER=slowgrowth,
    DB_PASSWORD=<PASSWORD>,
    REDIS_URL=<ELASTICACHE_ENDPOINT>,
    JWT_SECRET=<STRONG_SECRET>
  }"
```

## Step 7: Testing

```bash
# Test API Gateway
curl https://<API_ID>.execute-api.<REGION>.amazonaws.com/health

# Test frontend
curl https://<CLOUDFRONT_DOMAIN>/
```

## Monitoring & Maintenance

### CloudWatch Logs
- Lambda logs: `/aws/lambda/slow-growth-api`
- Monitor errors and performance

### Costs Monitoring
```bash
aws ce get-cost-and-usage \
  --time-period Start=2024-10-01,End=2024-10-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### Backup Strategy
- RDS automated backups (7 days retention)
- Manual snapshots before major updates

## Scaling Considerations

- **Lambda**: Auto-scales, set concurrency limits
- **Aurora**: Scales 0.5-2 ACUs automatically
- **ElastiCache**: Auto-scales based on memory/CPU
- **CloudFront**: Global CDN, handles traffic spikes

## Security Checklist

- [ ] Enable WAF on CloudFront
- [ ] Configure VPC for RDS/ElastiCache
- [ ] Set up IAM roles with least privilege
- [ ] Enable encryption at rest (RDS, S3)
- [ ] Configure HTTPS only (CloudFront)
- [ ] Set up AWS Secrets Manager for credentials
- [ ] Enable CloudTrail for audit logging

## Troubleshooting

### Lambda Cold Starts
- Use provisioned concurrency for critical endpoints
- Optimize bundle size

### Database Connection Pooling
- Use RDS Proxy for connection management
- Reduce Lambda timeout if needed

### CORS Issues
- Configure API Gateway CORS settings
- Update CloudFront behaviors

## Cost Optimization Tips

1. **Enable S3 Intelligent-Tiering** for static assets
2. **Use CloudFront caching** aggressively (especially for API responses)
3. **Set Aurora to pause** during low-traffic periods
4. **Monitor Lambda memory** settings (right-size)
5. **Use Reserved Capacity** if traffic is predictable

## Alternative: Terraform Deployment

See `terraform/` directory for Infrastructure as Code deployment (coming soon).

---

**Need Help?** Open an issue on GitHub or contact the team.
