# DesignProof Deployment Guide

## Prerequisites

- Docker & Docker Compose
- AWS Account (S3, RDS, EC2 optional)
- PostgreSQL 14+
- Node.js 18+
- Python 3.10+
- Redis 7+
- SSL Certificate (self-signed for dev, real for prod)

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/designproof.git
cd DesignProof
```

### 2. Setup PostgreSQL

```bash
# Create database
createdb designproof_db

# Create user
psql -U postgres -c "CREATE USER designproof_user WITH PASSWORD 'SecurePassword123';"

# Grant privileges
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE designproof_db TO designproof_user;"

# Run migrations
psql -U designproof_user -d designproof_db -f database/schema.sql
```

### 3. Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Setup AI Service

```bash
cd ../ai-service

# Copy environment file
cp .env.example .env

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 5. Setup Frontend

```bash
cd ../frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

## Docker Deployment

### 1. Docker Compose Setup (All services)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: designproof_db
    environment:
      POSTGRES_USER: designproof_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: designproof_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U designproof_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: designproof_redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API (Node.js)
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: designproof_backend
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      PORT: 5000
    ports:
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # AI Service (Python/FastAPI)
  ai-service:
    build:
      context: ./ai-service
      dockerfile: Dockerfile
    container_name: designproof_ai
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      BACKEND_API_URL: http://backend:5000
      PORT: 8000
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./ai-service/app:/app/app
      - ai_models:/models
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend (React)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: http://localhost:5000
    container_name: designproof_frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src

volumes:
  postgres_data:
  redis_data:
  ai_models:

networks:
  default:
    name: designproof_network
```

### 2. Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "src/server.js"]
```

### 3. AI Service Dockerfile

```dockerfile
# ai-service/Dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 4. Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 5. Run with Docker Compose

```bash
# Create .env file
cp .env.example .env
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## AWS Deployment

### 1. RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier designproof-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15 \
  --master-username designproof_admin \
  --master-user-password "YourSecurePassword" \
  --allocated-storage 100 \
  --db-name designproof_db

# Run migrations
psql -h designproof-prod.rds.amazonaws.com \
  -U designproof_admin \
  -d designproof_db \
  -f database/schema.sql
```

### 2. ElastiCache Redis

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id designproof-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1
```

### 3. S3 Image Storage

```bash
# Create S3 bucket
aws s3 mb s3://designproof-images-prod

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket designproof-images-prod \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
  --bucket designproof-images-prod \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### 4. EC2 Deployment

```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name designproof-key \
  --security-group-ids sg-12345678

# SSH into instance
ssh -i designproof-key.pem ec2-user@instance-ip

# Install Docker
sudo yum install -y docker
sudo systemctl start docker

# Deploy with Docker Compose
git clone https://github.com/yourusername/designproof.git
cd DesignProof
docker-compose up -d
```

## Production Configuration

### 1. Environment Variables

Create `.env.production`:

```bash
# Environment
NODE_ENV=production
VITE_ENV=production

# Database (RDS)
DATABASE_URL=postgresql://admin:password@designproof.rds.amazonaws.com/designproof_db

# Redis (ElastiCache)
REDIS_HOST=designproof-redis.abc123.ng.0001.use1.cache.amazonaws.com
REDIS_PORT=6379

# Security
JWT_SECRET=<use-strong-random-value>
JWT_EXPIRY=7d

# API URLs
API_BASE_URL=https://api.designproof.com
FRONTEND_URL=https://designproof.com

# Email Service
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-api-key>
FROM_EMAIL=noreply@designproof.com

# AWS
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
AWS_S3_BUCKET=designproof-images-prod
AWS_S3_REGION=us-east-1

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# AI Service
AI_SERVICE_URL=https://ai.designproof.com
AI_SERVICE_API_KEY=<secure-key>

# Monitoring
LOG_LEVEL=warn
SENTRY_DSN=<sentry-dsn>
```

### 2. SSL/TLS Certificate

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d api.designproof.com -d designproof.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 3. Nginx Configuration

```nginx
# /etc/nginx/sites-available/designproof
upstream backend {
    server localhost:5000;
}

upstream ai_service {
    server localhost:8000;
}

server {
    listen 443 ssl http2;
    server_name designproof.com www.designproof.com;

    ssl_certificate /etc/letsencrypt/live/designproof.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/designproof.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        root /var/www/designproof/dist;
        try_files $uri $uri/ /index.html;
        expires 1h;
    }

    # API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # AI Service
    location /ai/ {
        proxy_pass http://ai_service/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name designproof.com www.designproof.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. Database Backup

```bash
# Daily backup script
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/backups/designproof_$BACKUP_DATE.sql"

pg_dump postgresql://admin:password@designproof.rds.amazonaws.com/designproof_db | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://designproof-backups/

# Cleanup old backups (keep 30 days)
find /backups -name "designproof_*.sql*" -mtime +30 -delete
```

### 5. Monitoring Setup

```bash
# Install monitoring agent
curl -fsSL https://install.datadoghq.com/latest/scripts/install_unix_agent.sh | bash

# Configure DataDog
sudo nano /etc/datadog-agent/datadog.yaml

# Enable Docker integration
sudo systemctl restart datadog-agent
```

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  REGISTRY: docker.io
  IMAGE_NAME: designproof

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install & Test Backend
        run: |
          cd backend
          npm ci
          npm run lint
          npm test
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Test AI Service
        run: |
          cd ai-service
          pip install -r requirements.txt
          pytest

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker-compose build

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push $REGISTRY/$IMAGE_NAME/backend:latest
          docker push $REGISTRY/$IMAGE_NAME/ai-service:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ec2-user/DesignProof
            git pull origin main
            docker-compose pull
            docker-compose up -d
            docker-compose exec -T backend npm run migrate
```

## Monitoring & Alerts

### Health Checks

```bash
# Backend health
curl https://api.designproof.com/health

# AI Service health
curl https://api.designproof.com/ai/health
```

### Key Metrics

- Database response time < 200ms
- API response time < 500ms
- Error rate < 0.1%
- Uptime > 99.9%

### Alerting

Set up alerts for:
- High CPU/Memory usage (>80%)
- Database connection pool exhausted
- Redis memory limit exceeded
- Job queue backlog > 1000
- Error rate > 1%
- Deployment failures

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql -h designproof.rds.amazonaws.com -U admin -d designproof_db -c "SELECT 1"

# Check connection pool
SELECT count(*) FROM pg_stat_activity;
```

### Out of Memory

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=2048" npm start

# Check Redis memory
redis-cli INFO memory
```

### Image Processing Slow

```bash
# Monitor AI service queue
curl http://localhost:8000/health

# Scale AI workers
docker-compose up -d --scale ai-service=3
```

## Rollback Procedure

```bash
# Rollback to previous version
git revert HEAD
docker-compose down
docker-compose up -d

# or restore from backup
psql -h designproof.rds.amazonaws.com -U admin -d designproof_db < backup.sql
```

## Security Checklist

- [ ] Enable 2FA on AWS account
- [ ] Rotate secrets (JWT, API keys)
- [ ] Enable VPC security groups
- [ ] Configure WAF rules
- [ ] Enable database encryption
- [ ] Enable S3 bucket encryption
- [ ] Regular security audits
- [ ] Enable CloudTrail logging
- [ ] Configure backup retention
- [ ] Test disaster recovery

---

For support: deployment@designproof.com
