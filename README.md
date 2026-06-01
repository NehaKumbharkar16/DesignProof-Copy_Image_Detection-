# DesignProof - AI-Powered Brand & Design Protection SaaS

A comprehensive SaaS platform that helps fashion and ethnic wear brands detect copied designs, identify infringing websites, send compliant legal takedown notices, and protect their intellectual property using AI.

## 🎯 Project Overview

DesignProof is a professional-grade SaaS solution built with modern web technologies:

- **Frontend**: React 18 + Tailwind CSS (Responsive, Enterprise-grade UI)
- **Backend**: Node.js + Express (REST API)
- **AI Service**: Python + FastAPI (Image Similarity Detection, ML)
- **Database**: PostgreSQL (Comprehensive relational schema)
- **Security**: JWT Authentication, Encryption, Audit Logs, Rate Limiting

## 📁 Project Structure

```
DesignProof/
├── frontend/                 # React + Tailwind CSS Web Application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Page components (Dashboard, Onboarding, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API integration services
│   │   ├── store/           # Zustand state management
│   │   ├── styles/          # Global styles & Tailwind config
│   │   └── utils/           # Utility functions
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/                  # Node.js Express Backend
│   ├── src/
│   │   ├── routes/          # API endpoint definitions
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── models.py        # SQLAlchemy ORM models (Python reference)
│   │   ├── utils/           # Utility functions
│   │   ├── config/          # Configuration files
│   │   ├── jobs/            # Background jobs (Celery, BullMQ)
│   │   └── server.js        # Express server entry point
│   ├── package.json
│   └── .env.example
│
├── ai-service/              # Python FastAPI AI/ML Service
│   ├── app/
│   │   ├── routers/         # API endpoints
│   │   ├── models/          # Pydantic models
│   │   ├── services/        # AI/ML logic
│   │   ├── utils/           # Utility functions
│   │   ├── ml_models/       # Pre-trained model files
│   │   └── main.py          # FastAPI app
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── .env.example
│
├── database/
│   ├── schema.sql           # PostgreSQL database schema
│   ├── migrations/          # Database migration scripts
│   └── seeds/               # Initial data seeds
│
└── docs/                    # Documentation
    ├── API_DOCUMENTATION.md
    ├── ARCHITECTURE.md
    ├── SETUP_GUIDE.md
    ├── DEPLOYMENT.md
    └── DATABASE_GUIDE.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Redis 7+
- npm or yarn

### 1. Setup Database

```bash
# Create PostgreSQL database
createdb designproof_db

# Run schema
psql -U postgres -d designproof_db -f database/schema.sql
```

### 2. Setup Backend (Node.js)

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

### 3. Setup AI Service (Python)

```bash
cd ai-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start FastAPI server
uvicorn app.main:app --reload

# Server runs on http://localhost:8000
```

### 4. Setup Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Application runs on http://localhost:3000
```

## 🎨 Key Features

### For Clients (Brand Owners)

- **Brand Onboarding**: Verify business ownership and accept legal terms
- **Product Management**: Upload designs with drag-and-drop, bulk import from Shopify/WooCommerce
- **AI Monitoring**: Continuous design surveillance across multiple platforms
- **Smart Detection**: Identifies direct copies, modified versions, and inspired designs
- **Review Dashboard**: Side-by-side image comparison with similarity scores
- **Takedown Automation**: Generate and send legal notices (auto-detects Shopify stores)
- **Compliance Tracking**: Real-time removal status monitoring with proof screenshots
- **Auto-Escalation**: Escalate to hosting providers, payment gateways, ad platforms
- **Audit Trail**: Complete legal audit log for compliance
- **Reporting**: Analytics, metrics, and estimated revenue protection

### For Admin (SaaS Owner)

- **User Management**: View all clients, suspend/verify accounts
- **Subscription Control**: Manage plans (Free, Growth, Scale, Enterprise)
- **Usage Monitoring**: Track scans, emails, escalations, false-positives
- **Abuse Detection**: Auto-flag suspicious patterns and behaviors
- **Template Management**: Control legal language and takedown templates
- **Integration Control**: Manage Shopify, WooCommerce, and other platform APIs
- **Audit Logs**: Complete system transparency for legal protection

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent brute force and DoS attacks
- **CORS Protection**: Cross-origin request validation
- **Helmet.js**: HTTP headers security
- **Input Validation**: Strict schema validation with Pydantic/Joi
- **SQL Injection Prevention**: Parameterized queries via ORM
- **Audit Logging**: Every action logged for compliance
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **Data Encryption**: Sensitive data encrypted at rest and in transit

## 📊 Database Schema Highlights

### Core Entities

- **Users**: Authentication and role management
- **Brands**: Client organization and verification
- **Products**: Design inventory with visual fingerprints
- **DetectedMatches**: AI-identified potential infringements
- **TakedownNotices**: Legal notices and tracking
- **ComplianceTracking**: Removal status verification
- **BrandSubscriptions**: Billing and plan management
- **AuditLogs**: Complete action history (CRITICAL)

### Specialized Tables

- **MonitoringSettings**: Per-brand scanning preferences
- **WhitelistedDomains**: Authorized resellers
- **BlacklistedDomains**: Repeat offenders
- **PlatformIntegrations**: Shopify, WooCommerce connections
- **TakedownTemplates**: Legal template management
- **AbuseFlagsUsageTracking**: Anti-fraud monitoring

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern UI library
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management
- **Framer Motion**: Smooth animations
- **React Router**: Client-side routing

### Backend
- **Express.js**: Fast, minimalist web framework
- **PostgreSQL**: Enterprise-grade relational DB
- **Sequelize**: Promise-based ORM
- **Redis**: Caching and job queue
- **BullMQ**: Background job processing
- **Winston**: Structured logging

### AI Service
- **FastAPI**: Modern Python API framework
- **TensorFlow/PyTorch**: Deep learning frameworks
- **OpenCV**: Image processing
- **scikit-learn**: Machine learning utilities
- **Celery**: Distributed task queue

## 📋 API Endpoints (Overview)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Brands
- `POST /api/brands` - Create brand
- `GET /api/brands` - List brands
- `PUT /api/brands/:id` - Update brand
- `POST /api/brands/:id/verify` - Verify ownership

### Products
- `POST /api/products` - Upload product
- `GET /api/products` - List products
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Monitoring & Detection
- `GET /api/monitoring/status` - Get monitoring status
- `POST /api/scans` - Initiate scan
- `GET /api/detections` - List detected matches
- `PATCH /api/detections/:id` - Approve/ignore detection

### Takedowns
- `GET /api/takedowns` - List takedown notices
- `PATCH /api/takedowns/:id/approve` - Approve takedown
- `GET /api/takedowns/:id/status` - Check compliance

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/usage` - System usage analytics
- `GET /api/admin/abuse-flags` - Suspicious activities
- `GET /api/admin/audit-logs` - Complete audit trail

## 🔄 Data Flow

1. **Client Uploads Product**: Brand uploads design image
2. **AI Processing**: FastAPI extracts visual fingerprint
3. **Monitoring Triggered**: Scheduled scan against multiple sources
4. **Detection**: AI identifies potential copies
5. **Review Dashboard**: Client approves/ignores matches
6. **Takedown Sent**: Auto-generated legal notice (or escalation)
7. **Compliance Check**: Daily verification of removal
8. **Escalation**: Automatic escalation if no response (48-72 hrs)
9. **Audit Trail**: Complete legal record maintained

## 🚦 Deployment

### Docker Deployment (Recommended)

Each service has a Dockerfile. Use docker-compose for full stack:

```bash
docker-compose up -d
```

### Production Checklist

- [ ] Update all `.env` values for production
- [ ] Enable HTTPS/TLS
- [ ] Configure CDN for static assets
- [ ] Set up database backups
- [ ] Enable monitoring and alerts
- [ ] Configure email service (SendGrid, etc.)
- [ ] Set up payment processor (Stripe)
- [ ] Enable rate limiting and WAF
- [ ] Configure logging aggregation (ELK, DataDog)
- [ ] Set up CI/CD pipeline

## 📚 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP_GUIDE.md)
- [Database Guide](docs/DATABASE_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# AI service tests
cd ai-service
pytest
```

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 🆘 Support

For issues, questions, or suggestions:
- Email: support@designproof.com
- Documentation: [Docs](docs/)
- Issue Tracker: [GitHub Issues](https://github.com/designproof/issues)

## ⚠️ Important Notes

### Security & Compliance

1. **Never send takedowns without client approval** - Always require manual review
2. **Maintain audit logs** - Every action must be traceable for legal protection
3. **Clear agent representation** - Never claim to be a law firm
4. **Support whitelisting** - Allow authorized resellers to be marked
5. **Monitor abuse** - Flag accounts with suspicious patterns

### Best Practices

- Use HTTPS in production
- Rotate secrets regularly
- Monitor rate limits
- Keep dependencies updated
- Regular security audits
- Backup databases daily
- Test disaster recovery

## 🎯 Roadmap

### Phase 1 (MVP - Current)
- Core brand verification
- Product upload and management
- Basic design detection
- Simple takedown workflow
- Admin dashboard

### Phase 2
- Shopify integration
- WooCommerce integration
- Advanced escalation (hosting, payment gateways)
- Video similarity detection
- Chrome extension

### Phase 3
- WhatsApp seller detection
- Counterfeit pricing alerts
- Multi-brand agency accounts
- API access for large enterprises
- Success-fee legal escalation partnerships

---

**Built with ❤️ for Brand Protection**
