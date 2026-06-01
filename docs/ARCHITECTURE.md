# DesignProof Architecture Guide

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  React 18 SPA (Vite)                                               │
│  ├── Dashboard (Client)                                            │
│  ├── Product Management                                            │
│  ├── Detection Review                                              │
│  ├── Takedown Management                                           │
│  └── Admin Panel                                                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & LOAD BALANCER                      │
├─────────────────────────────────────────────────────────────────────┤
│  ├── CORS & Security Headers                                       │
│  ├── Rate Limiting                                                 │
│  ├── Request Validation                                            │
│  └── Logging & Monitoring                                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  EXPRESS SERVER  │ │ AI SERVICE       │ │ CACHE LAYER      │
│  (Node.js)       │ │ (Python/FastAPI) │ │ (Redis)          │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ ├── Auth         │ │ ├── Image        │ │ ├── Session      │
│ ├── API Routes   │ │ │   Similarity   │ │ ├── Cache        │
│ ├── Business     │ │ ├── Feature      │ │ ├── Rate Limit   │
│ │   Logic        │ │ │   Extraction   │ │ ├── Job Queue    │
│ ├── Database     │ │ ├── Pattern      │ │ └── Locks        │
│ │   Queries      │ │ │   Recognition  │ │                  │
│ └── Webhooks     │ │ └── ML Models    │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                              │
├─────────────────────────────────────────────────────────────────────┤
│  ├── Users & Auth                                                  │
│  ├── Brands & Products                                             │
│  ├── Detections & Matches                                          │
│  ├── Takedowns & Compliance                                        │
│  ├── Subscriptions & Billing                                       │
│  ├── Audit Logs                                                    │
│  └── Platform Integrations                                         │
└─────────────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES & INTEGRATIONS                       │
├─────────────────────────────────────────────────────────────────────┤
│  ├── AWS S3 (Image Storage)                                        │
│  ├── Shopify API                                                   │
│  ├── WooCommerce API                                               │
│  ├── Google Reverse Image Search                                   │
│  ├── Email Service (SendGrid/SMTP)                                 │
│  ├── Payment Gateway (Stripe)                                      │
│  └── Logging (ELK Stack / DataDog)                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Frontend Architecture (React)

```
src/
├── components/
│   ├── common/           # Shared components
│   │   ├── Header
│   │   ├── Sidebar
│   │   ├── Modal
│   │   └── Notification
│   ├── dashboard/        # Dashboard components
│   │   ├── ProductCard
│   │   ├── DetectionList
│   │   └── Analytics
│   ├── detection/        # Detection review
│   │   ├── ComparisonView
│   │   ├── SimilarityScore
│   │   └── ApprovalButton
│   └── admin/            # Admin components
│       ├── UserManagement
│       ├── UsageMonitor
│       └── AuditLog
├── pages/
│   ├── Home
│   ├── Dashboard
│   ├── Onboarding
│   ├── Products
│   ├── Detections
│   ├── Takedowns
│   └── Admin
├── hooks/
│   ├── useAuth.js
│   ├── useFetch.js
│   ├── useLocalStorage.js
│   └── useDebounce.js
├── services/
│   ├── api.js            # Axios instance
│   ├── auth.service.js
│   ├── brand.service.js
│   ├── product.service.js
│   ├── detection.service.js
│   └── takedown.service.js
├── store/
│   ├── authStore.js
│   ├── brandStore.js
│   ├── detectionStore.js
│   └── notificationStore.js
└── styles/
    ├── tailwind.config.js
    └── globals.css
```

**State Management (Zustand)**
- `authStore`: User auth, JWT, permissions
- `brandStore`: Active brand, subscription
- `detectionStore`: Detected matches, filters
- `notificationStore`: Toasts, alerts

### 2. Backend Architecture (Node.js)

```
src/
├── routes/
│   ├── auth.routes.js
│   ├── brand.routes.js
│   ├── product.routes.js
│   ├── detection.routes.js
│   ├── takedown.routes.js
│   ├── monitoring.routes.js
│   ├── dashboard.routes.js
│   ├── admin.routes.js
│   └── webhook.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── brand.controller.js
│   ├── product.controller.js
│   ├── detection.controller.js
│   ├── takedown.controller.js
│   └── admin.controller.js
├── services/
│   ├── auth.service.js
│   ├── brand.service.js
│   ├── product.service.js
│   ├── detection.service.js
│   ├── takedown.service.js
│   ├── email.service.js
│   ├── storage.service.js
│   ├── payment.service.js
│   └── audit.service.js
├── models/
│   ├── User.js
│   ├── Brand.js
│   ├── Product.js
│   ├── DetectedMatch.js
│   ├── TakedownNotice.js
│   └── ... (other ORM models)
├── middleware/
│   ├── auth.middleware.js
│   ├── errorHandler.middleware.js
│   ├── validation.middleware.js
│   ├── rateLimit.middleware.js
│   └── logging.middleware.js
├── jobs/
│   ├── scheduling.job.js    # Cron jobs
│   ├── scanning.job.js      # Product scanning
│   ├── compliance.job.js    # Removal checking
│   ├── reminder.job.js      # Email reminders
│   ├── abuse-detection.job.js
│   └── escalation.job.js
├── utils/
│   ├── email.util.js
│   ├── image.util.js
│   ├── jwt.util.js
│   ├── validation.util.js
│   └── logger.util.js
├── config/
│   ├── database.config.js
│   ├── redis.config.js
│   ├── email.config.js
│   └── stripe.config.js
└── server.js
```

**Request Flow**
1. Request → Express Router
2. Middleware (Auth, Validation, Rate Limit)
3. Controller → Service Layer
4. Service → Database/External APIs
5. Response → Client

### 3. AI Service Architecture (Python/FastAPI)

```
app/
├── routers/
│   ├── images.py         # Image upload/processing
│   ├── similarity.py     # Similarity detection
│   ├── scanning.py       # Batch scanning
│   └── health.py         # Health check
├── models/
│   ├── schemas.py        # Pydantic models
│   ├── ml_models.py      # TensorFlow/PyTorch models
│   └── database.py       # SQLAlchemy models
├── services/
│   ├── image_processor.py
│   ├── similarity_engine.py
│   ├── feature_extractor.py
│   ├── reverse_search.py  # Google Images, etc.
│   └── database.py
├── utils/
│   ├── cv_utils.py       # OpenCV utilities
│   ├── ml_utils.py       # ML utilities
│   ├── cache.py          # Redis cache
│   └── logger.py
├── ml_models/
│   ├── resnet50.pth      # Pre-trained weights
│   ├── vgg16.pth
│   └── config.json
└── main.py
```

**AI Processing Pipeline**
1. Image Received → Preprocessing
2. Feature Extraction (ResNet50)
3. Fingerprint Generation
4. Similarity Calculation
5. Confidence Scoring
6. Result Storage

## Data Flow Diagrams

### Product Upload Flow

```
Client uploads product
        ↓
Backend validates image
        ↓
Send to AI Service
        ↓
AI extracts features & generates fingerprint
        ↓
Store in PostgreSQL
        ↓
Store image in S3
        ↓
Activate monitoring
        ↓
Return product ID to client
```

### Detection Flow

```
Scheduled scan triggered (or manual)
        ↓
Retrieve active products for brand
        ↓
For each source (Google, Shopify, etc.):
    ├── Search for similar images
    ├── Send to AI Service
    ├── Compare with fingerprints
    ├── Calculate similarity score
    └── If > threshold → Create DetectedMatch
        ↓
Generate screenshots
        ↓
Store matches in PostgreSQL
        ↓
Send notification to client
        ↓
Create system alert
```

### Takedown Flow

```
Client approves detection
        ↓
Validate match (>threshold)
        ↓
Create TakedownNotice record
        ↓
If Shopify → Submit complaint via Shopify API
Else → Generate legal email
        ↓
Send email/complaint
        ↓
Log in audit_logs
        ↓
Notify client
        ↓
Set compliance check schedule
        ↓
Daily: Check if removed
    ├── If removed → Update status "removed"
    ├── If unchanged → Send reminder (after 3 days)
    └── If still unresponsive → Offer escalation
```

### Escalation Flow

```
Client approves escalation
        ↓
Identify target (hosting, payment, ad platform)
        ↓
If hosting → Send DMCA to hosting provider
If payment gateway → Report to payment processor
If ad platform → Submit ad complaint
        ↓
Track response
        ↓
Update TakedownNotice status
        ↓
Continue compliance tracking
```

## Authentication & Authorization

### JWT Token Structure

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "client",
  "brandId": "650e8400-e29b-41d4-a716-446655440001",
  "permissions": ["create_products", "review_matches", "send_takedowns"],
  "iat": 1707470400,
  "exp": 1708075200
}
```

### Role-Based Access Control

```
ADMIN:
  └── All endpoints
      ├── User management
      ├── Abuse monitoring
      ├── Audit logs
      └── Template management

CLIENT:
  ├── Brand management
  │   ├── Create brand
  │   ├── Verify ownership
  │   └── View subscription
  ├── Product management
  │   ├── Upload products
  │   ├── Update products
  │   └── Delete products
  ├── Detection review
  │   ├── View matches
  │   ├── Approve matches
  │   └── Ignore matches
  └── Takedown management
      ├── View takedowns
      └── Request escalation

SUPPORT:
  ├── View users
  ├── View brands
  └── View tickets
```

## Caching Strategy

### Redis Keys

```
user::<user_id>::profile
user::<user_id>::permissions
brand::<brand_id>::settings
brand::<brand_id>::subscription
product::<product_id>::fingerprint
detection::<detection_id>::ai_result
scan_job::<job_id>::status
rate_limit::<ip>
session::<token>
```

### Cache Invalidation

- User profile: Updated immediately on change
- Subscription: 5-minute TTL
- Product fingerprint: Never (immutable)
- Detection: 1-hour TTL
- Session: 7-day TTL

## Database Optimization

### Indexes

```sql
-- Performance critical indexes
CREATE INDEX ON users(email);
CREATE INDEX ON brands(owner_id);
CREATE INDEX ON products(brand_id);
CREATE INDEX ON detected_matches(brand_id, client_status);
CREATE INDEX ON takedown_notices(brand_id, notice_status);
CREATE INDEX ON audit_logs(created_at DESC);
CREATE INDEX ON brand_subscriptions(renews_at);

-- Composite indexes
CREATE INDEX ON detected_matches(brand_id, similarity_score DESC);
CREATE INDEX ON takedown_notices(brand_id, created_at DESC);
```

### Query Optimization

- Eager loading for relationships
- Pagination for large result sets
- Connection pooling
- Query result caching
- Materialized views for analytics

## Scalability Considerations

### Horizontal Scaling

1. **API Server**: Multiple Express instances behind load balancer
2. **AI Service**: Multiple FastAPI instances with task queue
3. **Database**: Read replicas for analytics
4. **Cache**: Redis cluster for high availability

### Vertical Scaling

- Increase server RAM for node processes
- GPU support for AI inference
- Database query optimization

### Job Queue

- BullMQ for background jobs
- Celery for AI tasks
- Priority queues for urgent operations
- Dead letter queues for failed jobs

## Monitoring & Observability

### Metrics to Track

```
Application:
  - Request count & latency
  - Error rate & exceptions
  - Database query time
  - Cache hit ratio
  - Job queue length

Business:
  - Scans completed
  - Detections found
  - Takedowns sent
  - Removal rate
  - User engagement

Infrastructure:
  - CPU & memory usage
  - Disk space
  - Network bandwidth
  - Database connections
```

### Logging

- Structured logging (JSON format)
- Log aggregation (ELK, DataDog)
- Log retention: 30 days
- Real-time alerts for errors

## Security Architecture

### Defense Layers

1. **Network**: WAF, DDoS protection
2. **Transport**: TLS 1.3, HSTS
3. **Authentication**: JWT, 2FA
4. **Authorization**: RBAC, scope-based
5. **Data**: Encryption at rest, field-level encryption
6. **Validation**: Input sanitization, schema validation
7. **Audit**: Complete audit log with IP/UA tracking

## Disaster Recovery

### Backup Strategy

- Database: Daily full backups, hourly incremental
- S3 images: Multi-region replication
- Configuration: Version controlled
- Recovery Time Objective (RTO): 1 hour
- Recovery Point Objective (RPO): 15 minutes

### High Availability

- Database: Primary + hot standby
- API: Multi-zone deployment
- Cache: Cluster mode enabled
- CDN for static assets
