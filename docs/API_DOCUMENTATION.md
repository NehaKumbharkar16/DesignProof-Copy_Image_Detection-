# DesignProof API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.designproof.com/api
```

## Authentication

All endpoints (except login/register) require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Register New User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "client"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "client"
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 3. Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 4. Logout

```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🏢 Brand Management Endpoints

### 1. Create Brand

```http
POST /brands
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Fashion Forward Ltd",
  "website_url": "https://fashionforward.com",
  "country": "United States",
  "industry": "Fashion",
  "business_email": "business@fashionforward.com",
  "phone": "+1987654321",
  "description": "Premium ethnic wear brand"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "name": "Fashion Forward Ltd",
    "website_url": "https://fashionforward.com",
    "is_verified": false,
    "verification_method": null,
    "verification_token": "verify_abc123def456",
    "subscription_status": "free",
    "created_at": "2024-02-09T10:30:00Z"
  }
}
```

### 2. List Brands

```http
GET /brands?page=1&limit=20&search=fashion
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "name": "Fashion Forward Ltd",
      "website_url": "https://fashionforward.com",
      "is_verified": true,
      "subscription_status": "active",
      "products_count": 45,
      "detections_count": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### 3. Get Brand Details

```http
GET /brands/{brand_id}
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440001",
    "name": "Fashion Forward Ltd",
    "website_url": "https://fashionforward.com",
    "country": "United States",
    "industry": "Fashion",
    "is_verified": true,
    "authorization_accepted": true,
    "terms_accepted": true,
    "subscription": {
      "plan_name": "Growth",
      "status": "active",
      "renews_at": "2024-03-09",
      "max_products": 500,
      "max_monthly_scans": 5000
    },
    "statistics": {
      "total_products": 45,
      "total_detections": 12,
      "pending_detections": 3,
      "completed_takedowns": 8
    }
  }
}
```

### 4. Verify Brand Ownership (Meta Tag)

```http
POST /brands/{brand_id}/verify
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "verification_method": "meta_tag"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Add this meta tag to your website's <head>",
    "meta_tag": "<meta name='designproof-verify' content='verify_abc123def456'>",
    "instructions": "Instructions for verification...",
    "verify_url": "/brands/{brand_id}/verify-complete"
  }
}
```

### 5. Complete Verification

```http
POST /brands/{brand_id}/verify-complete
Content-Type: application/json

{
  "verification_method": "meta_tag"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Brand verified successfully",
  "data": {
    "is_verified": true,
    "verified_at": "2024-02-09T11:30:00Z"
  }
}
```

---

## 📦 Product Management Endpoints

### 1. Upload Product

```http
POST /products
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

{
  "brand_id": "650e8400-e29b-41d4-a716-446655440001",
  "name": "Designer Saree Collection",
  "sku": "SAREE-001",
  "category": "Traditional Wear",
  "collection": "Summer 2024",
  "priority": "high",
  "description": "Hand-embroidered traditional saree",
  "images": [file1.jpg, file2.jpg],
  "product_url": "https://fashionforward.com/products/saree-001"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "name": "Designer Saree Collection",
    "sku": "SAREE-001",
    "category": "Traditional Wear",
    "priority": "high",
    "protection_active": true,
    "image_fingerprint": "fingerprint_hash_abc123",
    "images": [
      {
        "id": "850e8400-e29b-41d4-a716-446655440003",
        "url": "https://s3.amazonaws.com/designproof-images/product1.jpg",
        "fingerprint": "fingerprint_hash_xyz789"
      }
    ],
    "created_at": "2024-02-09T12:00:00Z"
  }
}
```

### 2. List Products

```http
GET /products?brand_id=650e8400-e29b-41d4-a716-446655440001&page=1&limit=20
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "750e8400-e29b-41d4-a716-446655440002",
      "name": "Designer Saree Collection",
      "category": "Traditional Wear",
      "priority": "high",
      "protection_active": true,
      "image_url": "https://s3.amazonaws.com/...",
      "detections_count": 3,
      "pending_takedowns": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### 3. Get Product Details

```http
GET /products/{product_id}
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "name": "Designer Saree Collection",
    "sku": "SAREE-001",
    "category": "Traditional Wear",
    "collection": "Summer 2024",
    "priority": "high",
    "description": "Hand-embroidered traditional saree",
    "protection_active": true,
    "images": [
      {
        "id": "850e8400-e29b-41d4-a716-446655440003",
        "url": "https://s3.amazonaws.com/...",
        "fingerprint": "fingerprint_hash"
      }
    ],
    "detections": [
      {
        "id": "950e8400-e29b-41d4-a716-446655440004",
        "similarity_score": 92.5,
        "confidence_tag": "direct_copy",
        "infringing_url": "https://copycat.com/saree",
        "status": "pending"
      }
    ],
    "created_at": "2024-02-09T12:00:00Z"
  }
}
```

### 4. Update Product

```http
PUT /products/{product_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Product Name",
  "priority": "critical",
  "protection_active": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "name": "Updated Product Name",
    "priority": "critical",
    "updated_at": "2024-02-09T13:00:00Z"
  }
}
```

### 5. Delete Product

```http
DELETE /products/{product_id}
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🔍 Detection & Monitoring Endpoints

### 1. Get Monitoring Settings

```http
GET /monitoring/settings?brand_id=650e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "a50e8400-e29b-41d4-a716-446655440005",
    "brand_id": "650e8400-e29b-41d4-a716-446655440001",
    "scan_frequency": "daily",
    "is_continuous_monitoring": true,
    "sources": {
      "scan_d2c_websites": true,
      "scan_shopify_stores": true,
      "scan_google_images": true,
      "scan_social_ads": true
    },
    "similarity_threshold": 70,
    "last_scan_at": "2024-02-09T08:00:00Z",
    "next_scheduled_scan": "2024-02-10T08:00:00Z"
  }
}
```

### 2. Update Monitoring Settings

```http
PUT /monitoring/settings/{setting_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "scan_frequency": "weekly",
  "similarity_threshold": 75,
  "scan_d2c_websites": true,
  "scan_shopify_stores": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "a50e8400-e29b-41d4-a716-446655440005",
    "scan_frequency": "weekly",
    "similarity_threshold": 75,
    "updated_at": "2024-02-09T14:00:00Z"
  }
}
```

### 3. Initiate Manual Scan

```http
POST /scans/manual
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "brand_id": "650e8400-e29b-41d4-a716-446655440001",
  "product_ids": ["750e8400-e29b-41d4-a716-446655440002"],
  "sources": ["google_images", "shopify_stores"]
}
```

**Response (202):**
```json
{
  "success": true,
  "data": {
    "scan_id": "b50e8400-e29b-41d4-a716-446655440006",
    "status": "processing",
    "products_count": 1,
    "estimated_completion": "2024-02-09T15:00:00Z",
    "message": "Scan initiated. You'll be notified when results are ready."
  }
}
```

### 4. Get Detected Matches

```http
GET /detections?brand_id=650e8400-e29b-41d4-a716-446655440001&status=pending&page=1&limit=20
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "950e8400-e29b-41d4-a716-446655440004",
      "product": {
        "id": "750e8400-e29b-41d4-a716-446655440002",
        "name": "Designer Saree"
      },
      "infringing_url": "https://copycat.com/saree",
      "infringing_image_url": "https://copycat.com/images/saree.jpg",
      "detected_platform": "shopify",
      "similarity_score": 92.5,
      "confidence_tag": "direct_copy",
      "detected_seller_name": "Copycat Store",
      "client_status": "pending",
      "screenshot_url": "https://s3.amazonaws.com/screenshots/...",
      "detected_at": "2024-02-09T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "pages": 1
  }
}
```

### 5. Get Detection Details

```http
GET /detections/{detection_id}
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "950e8400-e29b-41d4-a716-446655440004",
    "product": {
      "id": "750e8400-e29b-41d4-a716-446655440002",
      "name": "Designer Saree",
      "image_url": "https://s3.amazonaws.com/original.jpg"
    },
    "infringing_url": "https://copycat.com/saree",
    "infringing_image_url": "https://copycat.com/images/saree.jpg",
    "similarity_score": 92.5,
    "confidence_tag": "direct_copy",
    "ai_analysis": {
      "color_similarity": 0.95,
      "pattern_similarity": 0.89,
      "shape_similarity": 0.91,
      "details": "Direct copy with minor color variations"
    },
    "client_status": "pending",
    "approved_by": null,
    "is_authorized_reseller": false,
    "detected_at": "2024-02-09T10:30:00Z"
  }
}
```

### 6. Approve Detection

```http
PATCH /detections/{detection_id}/approve
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "action": "approve_takedown",
  "notes": "Definite copy, proceed with takedown"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "950e8400-e29b-41d4-a716-446655440004",
    "client_status": "approved",
    "approved_at": "2024-02-09T15:00:00Z",
    "takedown_notice_id": "c50e8400-e29b-41d4-a716-446655440007"
  }
}
```

### 7. Ignore Detection

```http
PATCH /detections/{detection_id}/ignore
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reason": "This is an authorized reseller"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "950e8400-e29b-41d4-a716-446655440004",
    "client_status": "ignored",
    "ignored_at": "2024-02-09T15:00:00Z"
  }
}
```

---

## ⚖️ Takedown Management Endpoints

### 1. Get Takedown Notices

```http
GET /takedowns?brand_id=650e8400-e29b-41d4-a716-446655440001&status=pending&page=1&limit=20
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "c50e8400-e29b-41d4-a716-446655440007",
      "product_name": "Designer Saree",
      "target_url": "https://copycat.com/saree",
      "target_platform": "shopify",
      "notice_status": "sent",
      "sent_at": "2024-02-09T16:00:00Z",
      "deadline_at": "2024-02-12T16:00:00Z",
      "response_received": false,
      "reminders_sent": 0,
      "compliance_status": "pending"
    }
  ]
}
```

### 2. Get Takedown Details

```http
GET /takedowns/{takedown_id}
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "c50e8400-e29b-41d4-a716-446655440007",
    "detection": {
      "id": "950e8400-e29b-41d4-a716-446655440004",
      "similarity_score": 92.5
    },
    "product": {
      "id": "750e8400-e29b-41d4-a716-446655440002",
      "name": "Designer Saree"
    },
    "target_url": "https://copycat.com/saree",
    "target_platform": "shopify",
    "target_domain": "copycat.com",
    "notice_content": "Legal notice text...",
    "notice_status": "sent",
    "sent_from_email": "legal@fashionforward.com",
    "sent_to_email": "support@copycat.com",
    "is_shopify_store": true,
    "shopify_complaint_id": "12345",
    "deadline_at": "2024-02-12T16:00:00Z",
    "response_received": false,
    "reminders_sent": 0,
    "sent_at": "2024-02-09T16:00:00Z",
    "compliance": {
      "status": "pending",
      "last_checked_at": "2024-02-09T20:00:00Z",
      "removal_verified": false
    }
  }
}
```

### 3. Request Escalation

```http
POST /takedowns/{takedown_id}/escalate
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "escalation_type": "hosting",
  "reason": "No response after 3 days"
}
```

**Response (202):**
```json
{
  "success": true,
  "data": {
    "id": "c50e8400-e29b-41d4-a716-446655440007",
    "escalation_type": "hosting",
    "escalation_approved": true,
    "escalation_approved_at": "2024-02-09T17:00:00Z",
    "message": "Escalation approved. Notice will be sent to hosting provider."
  }
}
```

---

## 📊 Dashboard & Reporting Endpoints

### 1. Get Brand Dashboard

```http
GET /dashboard?brand_id=650e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_products": 45,
      "protection_active": 45,
      "total_copies_detected": 12,
      "pending_detections": 3,
      "completed_takedowns": 8,
      "success_rate": 66.67,
      "estimated_revenue_protected": "$250,000"
    },
    "recent_detections": [
      {
        "id": "950e8400-e29b-41d4-a716-446655440004",
        "product_name": "Designer Saree",
        "similarity_score": 92.5,
        "detected_at": "2024-02-09T10:30:00Z"
      }
    ],
    "recent_takedowns": [
      {
        "id": "c50e8400-e29b-41d4-a716-446655440007",
        "product_name": "Designer Saree",
        "status": "resolved",
        "sent_at": "2024-02-08T16:00:00Z",
        "removal_verified_at": "2024-02-09T10:00:00Z"
      }
    ]
  }
}
```

### 2. Get Usage Analytics

```http
GET /analytics/usage?brand_id=650e8400-e29b-41d4-a716-446655440001&month=2024-02
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "month": "2024-02",
    "metrics": {
      "total_scans": 120,
      "successful_scans": 115,
      "failed_scans": 5,
      "matches_detected": 12,
      "takedowns_sent": 10,
      "takedowns_completed": 8,
      "escalations_triggered": 2,
      "false_positives": 1
    },
    "subscription_limits": {
      "max_monthly_scans": 5000,
      "remaining_scans": 4880,
      "max_products": 500
    }
  }
}
```

### 3. Export Report (PDF/CSV)

```http
GET /reports/export?brand_id=650e8400-e29b-41d4-a716-446655440001&format=pdf&start_date=2024-01-01&end_date=2024-02-09
Authorization: Bearer <jwt_token>
```

**Response (200):**
- Binary PDF/CSV file

---

## 👨‍💼 Admin Endpoints

### 1. Get All Users (Admin Only)

```http
GET /admin/users?page=1&limit=50&role=client&search=email
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "client",
      "is_active": true,
      "is_verified": true,
      "brands_count": 2,
      "last_login_at": "2024-02-09T14:00:00Z",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 245
  }
}
```

### 2. Suspend User (Admin Only)

```http
PATCH /admin/users/{user_id}/suspend
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "reason": "Abuse of service"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "is_active": false,
    "suspended_at": "2024-02-09T18:00:00Z"
  }
}
```

### 3. Get Abuse Flags (Admin Only)

```http
GET /admin/abuse-flags?status=unresolved&page=1&limit=20
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "d50e8400-e29b-41d4-a716-446655440008",
      "brand_id": "650e8400-e29b-41d4-a716-446655440001",
      "flag_reason": "excessive_takedowns",
      "description": "Brand sent 500 takedowns in 1 hour",
      "severity": "critical",
      "is_resolved": false,
      "flagged_at": "2024-02-09T12:00:00Z"
    }
  ]
}
```

### 4. View Audit Logs (Admin Only)

```http
GET /admin/audit-logs?action=approved_takedown&user_id=550e8400&page=1&limit=50
Authorization: Bearer <admin_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "e50e8400-e29b-41d4-a716-446655440009",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "brand_id": "650e8400-e29b-41d4-a716-446655440001",
      "action": "approved_takedown",
      "entity_type": "takedown_notice",
      "entity_id": "c50e8400-e29b-41d4-a716-446655440007",
      "changes_description": "Takedown approved for copycat.com",
      "ip_address": "192.168.1.1",
      "created_at": "2024-02-09T15:00:00Z"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "BAD_REQUEST",
  "message": "Invalid request parameters",
  "details": {
    "field": ["error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required or invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again later.",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limits

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 10 requests per 15 minutes
- **Image upload**: 50 MB per file, 500 MB per day
- **Scan initiation**: 1000 scans per month (depends on plan)

---

## Webhook Events

Subscribe to webhooks for real-time updates:

```
POST https://your-app.com/webhooks
```

Events:
- `detection.created` - New match detected
- `takedown.sent` - Takedown notice sent
- `takedown.completed` - Takedown completed
- `scan.completed` - Scan finished
- `compliance.verified` - Removal verified
- `escalation.triggered` - Escalation sent

---

## Pagination

All list endpoints support pagination:

```
GET /endpoint?page=1&limit=20&sort=created_at&order=desc
```

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "pages": 13
  }
}
```

---

For more information, visit [https://docs.designproof.com](https://docs.designproof.com)
