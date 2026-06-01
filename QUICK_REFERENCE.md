# DesignProof - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### Prerequisites Check
```bash
node --version    # ≥ 18.0.0
npm --version     # ≥ 9.0.0
python --version  # ≥ 3.10.0
psql --version    # ≥ 14.0.0
redis-cli --version
```

### One-Command Setup (Assuming tools installed)

**Windows:**
```batch
# Terminal 1: Database
psql -U postgres
CREATE USER designproof_user WITH PASSWORD 'SecurePassword123!';
CREATE DATABASE designproof_db OWNER designproof_user;
GRANT ALL PRIVILEGES ON DATABASE designproof_db TO designproof_user;
\q
psql -U designproof_user -d designproof_db -f database/schema.sql

# Terminal 2: Backend
cd backend && cp .env.example .env
npm install && npm run dev

# Terminal 3: AI Service
cd ai-service && python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Terminal 4: Frontend
cd frontend && cp .env.example .env
npm install && npm run dev
```

**macOS/Linux:**
```bash
# Terminal 1: Database
psql -U postgres
CREATE USER designproof_user WITH PASSWORD 'SecurePassword123!';
CREATE DATABASE designproof_db OWNER designproof_user;
GRANT ALL PRIVILEGES ON DATABASE designproof_db TO designproof_user;
\q
psql -U designproof_user -d designproof_db -f database/schema.sql

# Terminal 2: Backend
cd backend && cp .env.example .env
npm install && npm run dev

# Terminal 3: AI Service
cd ai-service && python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Terminal 4: Frontend
cd frontend && cp .env.example .env
npm install && npm run dev
```

---

## 📋 Critical File Reference

| File | Purpose | Lines |
|------|---------|-------|
| [database/schema.sql](database/schema.sql) | PostgreSQL schema (26 tables) | 1,000+ |
| [backend/models.py](backend/models.py) | SQLAlchemy ORM models | 800+ |
| [backend/package.json](backend/package.json) | Backend dependencies | 50+ |
| [ai-service/pyproject.toml](ai-service/pyproject.toml) | AI dependencies | 40+ |
| [frontend/package.json](frontend/package.json) | Frontend dependencies | 50+ |
| [README.md](README.md) | Project overview | 500+ |
| [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Installation guide | 1,000+ |
| [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | API reference | 2,000+ |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design | 1,000+ |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment guide | 1,000+ |
| [docs/DATABASE_GUIDE.md](docs/DATABASE_GUIDE.md) | Database operations | 800+ |

---

## 🔗 Service URLs (Development)

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5000 | 5000 |
| AI Service | http://localhost:8000 | 8000 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6379 | 6379 |

---

## 🔐 Default Credentials (Development Only)

```
Database User: designproof_user
Database Password: SecurePassword123!
Database Name: designproof_db
```

**⚠️ Change these in production!**

---

## 📁 Project Structure Map

```
DesignProof/
├── frontend/          → React + Tailwind CSS UI
├── backend/           → Node.js + Express API
├── ai-service/        → Python + FastAPI ML
├── database/          → PostgreSQL schema
├── docs/              → 6 comprehensive guides
└── README files       → Quick references
```

---

## 🔍 Database Tables at a Glance

### Users & Auth
- `users` - System users
- `audit_logs` - Action tracking

### Business
- `brands` - Client organizations
- `products` - Product designs
- `product_images` - Multiple images per product

### Detection
- `monitoring_settings` - Scan preferences
- `detected_matches` - Found copies (AI results)

### Legal
- `takedown_notices` - Sent notices
- `compliance_tracking` - Removal verification
- `whitelisted_domains` - Authorized sellers
- `blacklisted_domains` - Known infringers

### Subscriptions
- `subscription_plans` - Plan definitions
- `brand_subscriptions` - Active subscriptions
- `invoices` - Billing records

### Admin
- `system_alerts` - User notifications
- `abuse_flags` - Fraud detection
- `usage_tracking` - Analytics
- `platform_integrations` - Connected services
- `takedown_templates` - Email templates
- `reminder_templates` - Reminder templates

---

## 🚀 Common Commands

### Backend
```bash
cd backend
npm install           # Install dependencies
npm run dev          # Start dev server
npm test             # Run tests
npm run lint         # Check code style
npm run migrate      # Run migrations
npm run seed         # Seed sample data
```

### AI Service
```bash
cd ai-service
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # Start server
pytest                          # Run tests
```

### Frontend
```bash
cd frontend
npm install           # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Check code style
```

### Database
```bash
# Connect to database
psql -U designproof_user -d designproof_db

# Backup
pg_dump -U designproof_user -d designproof_db > backup.sql

# Restore
psql -U designproof_user -d designproof_db < backup.sql

# Check tables
\dt
```

---

## 📊 API Endpoint Categories

| Category | Count | Examples |
|----------|-------|----------|
| Auth | 4 | register, login, refresh, logout |
| Brands | 5 | create, list, get, update, verify |
| Products | 5 | upload, list, get, update, delete |
| Detection | 6 | get settings, scan, list, get, approve, ignore |
| Takedowns | 3 | list, get, escalate |
| Dashboard | 3 | summary, analytics, export |
| Admin | 4 | users, subscriptions, abuse flags, audit logs |

**Full Docs**: [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## 🔒 Security Essentials

```
JWT Secret: min 32 chars, random
Database Password: Strong (Upper + Lower + Numbers + Symbols)
S3 Access Key: Kept in secrets manager
API Keys: Never in version control
HTTPS: Required for production
CORS: Whitelist specific origins
Rate Limit: 100 req/15 min per IP
```

---

## 🐛 Troubleshooting Quick Fixes

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error
```bash
# Test PostgreSQL
psql -U designproof_user -d designproof_db -c "SELECT 1"

# Reset connection
# Edit .env DATABASE_URL variable
```

### Node Dependencies Issue
```bash
npm cache clean --force
rm package-lock.json
rm -rf node_modules
npm install
```

### Python Virtual Environment
```bash
# Remove and recreate
rm -rf venv
python -m venv venv
source venv/bin/activate  # macOS/Linux
# or venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

---

## 📚 Documentation Quick Links

| Guide | Purpose | Read Time |
|-------|---------|-----------|
| [README.md](README.md) | Project overview | 5 min |
| [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) | Installation | 15 min |
| [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | API reference | 20 min |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design | 20 min |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deploy | 15 min |
| [DATABASE_GUIDE.md](docs/DATABASE_GUIDE.md) | Database ops | 15 min |

---

## 💡 Key Concepts

### AI Detection Flow
1. **Upload** → Product image stored in S3
2. **Fingerprint** → AI creates visual hash
3. **Monitor** → Scheduled scan against sources
4. **Detect** → AI finds similar images
5. **Compare** → Calculate similarity score
6. **Review** → Client approves matches
7. **Takedown** → Legal notice sent
8. **Verify** → Check removal daily

### Security Layers
1. **Transport** → HTTPS/TLS 1.3
2. **Auth** → JWT + 2FA
3. **DB** → Parameterized queries
4. **Input** → Validation + sanitization
5. **Audit** → Log every action
6. **Rate** → Limit requests/IP
7. **Headers** → CORS + security headers

### Data Models
- **Users** → Authentication
- **Brands** → Client organizations
- **Products** → Client's designs
- **Detections** → Found copies
- **Takedowns** → Legal notices
- **Compliance** → Removal tracking
- **Audit** → Legal record

---

## 🎯 Success Checklist

### Setup Complete When:
- [ ] PostgreSQL database created and schema loaded
- [ ] Backend starts on http://localhost:5000
- [ ] AI Service starts on http://localhost:8000
- [ ] Frontend starts on http://localhost:3000
- [ ] Can register user via API
- [ ] Database queries work
- [ ] All environment variables set

### Development Ready When:
- [ ] Backend routes working
- [ ] Frontend pages rendering
- [ ] API endpoints tested
- [ ] Database queries tested
- [ ] Authentication working
- [ ] AI service responding
- [ ] Tests passing

### Production Ready When:
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security audit done
- [ ] Performance tested
- [ ] Monitoring configured
- [ ] Backup tested
- [ ] Documentation updated

---

## 📞 Getting Help

### Documentation
- 📖 Guides in `/docs` folder
- 📋 README files in root
- 🔍 Comments in code

### Common Issues
- Check [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) Troubleshooting section
- Check [DEPLOYMENT.md](docs/DEPLOYMENT.md) Troubleshooting section

### Contact
- Email: setup@designproof.com
- GitHub Issues: Create detailed issue
- Documentation: Complete & comprehensive

---

## 🎓 Learning Path

1. **Start here**: [README.md](README.md)
2. **Setup**: [SETUP_GUIDE.md](docs/SETUP_GUIDE.md)
3. **Architecture**: [ARCHITECTURE.md](docs/ARCHITECTURE.md)
4. **API**: [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
5. **Database**: [DATABASE_GUIDE.md](docs/DATABASE_GUIDE.md)
6. **Deploy**: [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🏆 Project Status

✅ **Foundation Complete**
- Database schema ✅
- ORM models ✅
- Config files ✅
- Documentation ✅
- Security planned ✅

📋 **Ready for Development**
- Backend ✅
- AI Service ✅
- Frontend ✅
- Integration ✅

---

## 🚀 You're Ready!

Everything is set up. Choose a terminal and start:

```bash
cd DesignProof/backend && npm run dev
# or
cd DesignProof/ai-service && uvicorn app.main:app --reload
# or
cd DesignProof/frontend && npm run dev
```

**Happy coding!** 🎉

---

*Last Updated: February 9, 2026*
*Version: 1.0.0-alpha*
