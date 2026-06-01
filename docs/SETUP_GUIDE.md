# DesignProof Setup Guide

## Complete Setup Instructions

This guide walks you through setting up DesignProof for development and production.

## System Requirements

### Development Environment

- **OS**: Windows 10+, macOS 11+, Ubuntu 20.04+
- **Node.js**: 18.0.0 or higher
- **Python**: 3.10 or higher
- **PostgreSQL**: 14.0 or higher
- **Redis**: 7.0 or higher
- **RAM**: Minimum 8GB (recommended 16GB)
- **Storage**: Minimum 50GB free space

### Required Tools

```bash
# Check versions
node --version   # should be v18.x.x
npm --version    # should be 9.x.x or higher
python --version # should be 3.10.x or higher
psql --version   # should be 14.x or higher
redis-server --version
```

## Step 1: Database Setup

### 1.1 Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run installer (PostgreSQL 14+)
3. Remember the password for `postgres` user
4. Keep default port 5432

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 1.2 Create Database & User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create designproof user
CREATE USER designproof_user WITH PASSWORD 'SecurePassword123!';

# Create database
CREATE DATABASE designproof_db OWNER designproof_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE designproof_db TO designproof_user;

# Exit
\q
```

### 1.3 Import Schema

```bash
# Navigate to project root
cd DesignProof

# Run schema (from your password prompt)
psql -U designproof_user -d designproof_db -f database/schema.sql

# Verify tables created
psql -U designproof_user -d designproof_db -c "\dt"
```

### 1.4 Verify Database

```bash
# Connect to database
psql -U designproof_user -d designproof_db

# Test query
SELECT version();

# Exit
\q
```

## Step 2: Redis Setup

### 2.1 Install Redis

**Windows:**
Download from: https://github.com/microsoftarchive/redis/releases

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

### 2.2 Verify Redis

```bash
redis-cli
ping  # Should return PONG
quit
```

## Step 3: Backend Setup

### 3.1 Install Dependencies

```bash
cd backend
npm install
```

### 3.2 Configure Environment

```bash
# Copy example env
cp .env.example .env

# Edit with your values
nano .env
```

**Critical .env settings:**
```
DATABASE_URL=postgresql://designproof_user:SecurePassword123!@localhost:5432/designproof_db
REDIS_HOST=localhost
JWT_SECRET=your-super-secret-key-min-32-characters-long
FRONTEND_URL=http://localhost:3000
```

### 3.3 Verify Setup

```bash
# Start development server
npm run dev

# Should show: Server running on http://localhost:5000
# Visit: http://localhost:5000/health
```

## Step 4: AI Service Setup

### 4.1 Create Virtual Environment

**Windows:**
```bash
cd ../ai-service
python -m venv venv
venv\Scripts\activate
```

**macOS/Ubuntu:**
```bash
cd ../ai-service
python3 -m venv venv
source venv/bin/activate
```

### 4.2 Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt

# For GPU support (optional)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### 4.3 Configure Environment

```bash
cp .env.example .env
nano .env
```

**Critical settings:**
```
DATABASE_URL=postgresql://designproof_user:SecurePassword123!@localhost:5432/designproof_db
BACKEND_API_URL=http://localhost:5000
```

### 4.4 Start AI Service

```bash
uvicorn app.main:app --reload --port 8000

# Should show: Uvicorn running on http://127.0.0.1:8000
```

## Step 5: Frontend Setup

### 5.1 Install Dependencies

```bash
cd ../frontend
npm install
```

### 5.2 Configure Environment

```bash
cp .env.example .env
nano .env
```

**Settings:**
```
VITE_API_BASE_URL=http://localhost:5000
```

### 5.3 Start Development Server

```bash
npm run dev

# Should show: Local: http://localhost:5000
# But actually runs on port 5173 usually
```

## Step 6: Verify Complete Setup

### 6.1 All Services Running

Open in separate terminals:

Terminal 1 - Backend:
```bash
cd backend && npm run dev
# Expected: Server running on http://localhost:5000
```

Terminal 2 - AI Service:
```bash
cd ai-service && source venv/bin/activate && uvicorn app.main:app --reload --port 8000
# Expected: Uvicorn running on http://127.0.0.1:8000
```

Terminal 3 - Frontend:
```bash
cd frontend && npm run dev
# Expected: Local: http://localhost:5173
```

### 6.2 Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# AI Service health
curl http://localhost:8000/health

# Database connection
psql -U designproof_user -d designproof_db -c "SELECT COUNT(*) FROM users;"
```

### 6.3 Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

## Step 7: Seed Sample Data (Optional)

```bash
cd backend
npm run seed

# Creates:
# - 5 test users
# - 10 test brands
# - 50 test products
# - Sample detections & takedowns
```

## Development Workflow

### Daily Startup

```bash
# Terminal 1: Backend
cd DesignProof/backend && npm run dev

# Terminal 2: AI Service
cd DesignProof/ai-service && source venv/bin/activate && uvicorn app.main:app --reload

# Terminal 3: Frontend
cd DesignProof/frontend && npm run dev
```

### Database Migrations

```bash
# Create new migration
cd backend
npm run migrate:create -- create_new_table

# Run migrations
npm run migrate:up

# Rollback migration
npm run migrate:down
```

### Running Tests

```bash
# Backend tests
cd backend && npm test

# AI Service tests
cd ai-service && pytest

# Frontend tests
cd frontend && npm test
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
# Windows
netstat -ano | findstr :5000

# macOS/Ubuntu
lsof -i :5000

# Kill process
# Windows
taskkill /PID <PID> /F

# macOS/Ubuntu
kill -9 <PID>
```

### Database Connection Error

```bash
# Test connection
psql -U designproof_user -d designproof_db

# If connection refused:
# 1. Verify PostgreSQL is running
# 2. Check credentials in .env
# 3. Ensure database exists: psql -U postgres -l
```

### Redis Connection Error

```bash
# Check if Redis is running
redis-cli ping

# Start Redis if not running
# Windows: Run redis-server from installation directory
# macOS: brew services start redis
# Ubuntu: sudo systemctl start redis-server
```

### Python Virtual Environment Issues

```bash
# Deactivate current environment
deactivate

# Remove venv and recreate
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### npm Dependencies Issues

```bash
# Clear cache
npm cache clean --force

# Reinstall
rm package-lock.json
rm -rf node_modules
npm install
```

## Environment Variables Reference

### Backend (.env)

```bash
# Required
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost/db
JWT_SECRET=min-32-character-secret-key

# Optional but recommended
REDIS_HOST=localhost
FRONTEND_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:8000
LOG_LEVEL=debug
```

### AI Service (.env)

```bash
# Required
DATABASE_URL=postgresql://user:pass@localhost/db
BACKEND_API_URL=http://localhost:5000

# Optional
REDIS_HOST=localhost
LOG_LEVEL=INFO
USE_GPU=false
```

### Frontend (.env)

```bash
# Required
VITE_API_BASE_URL=http://localhost:5000

# Optional
VITE_ENV=development
VITE_LOG_LEVEL=debug
```

## IDE Setup

### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-python.python",
    "ms-python.debugpy",
    "ms-python.vscode-pylance"
  ]
}
```

### Settings

Create `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[python]": {
    "editor.defaultFormatter": "ms-python.python",
    "editor.formatOnSave": true
  },
  "python.linting.pylintEnabled": true
}
```

## Next Steps

1. ✅ **Setup complete**
2. 📖 Read [API Documentation](API_DOCUMENTATION.md)
3. 🏗️ Review [Architecture](ARCHITECTURE.md)
4. 🚀 Explore [Deployment Guide](DEPLOYMENT.md)
5. 📦 Check [Database Guide](DATABASE_GUIDE.md)

## Getting Help

- Documentation: See `docs/` folder
- Issues: Check GitHub issues
- Questions: support@designproof.com
- Bugs: Create an issue with reproduction steps

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend API | 5000 | http://localhost:5000 |
| AI Service | 8000 | http://localhost:8000 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

---

**You're all set! Happy coding!** 🚀
