# QRCode Builder v2

A powerful QRCode SaaS platform for creating and managing QR codes with dynamic features, analytics, and bulk operations.

## Features

- **Static & Dynamic QR Codes**: Create QR codes that can be updated after creation
- **Multiple Formats**: Generate PNG, SVG formats
- **Analytics**: Track scans with detailed analytics
- **Bulk Operations**: Upload CSV files to create multiple QR codes at once
- **Password Protection**: Secure QR codes with passwords
- **Expiry Control**: Set expiration dates for QR codes
- **Rate Limiting**: Prevent abuse with built-in rate limiting
- **RESTful API**: Complete API for integration

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)

### Development Setup

#### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The backend will be available at http://localhost:8000

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

### Using Docker Compose

```bash
docker-compose up --build
```

This will start:
- Backend at http://localhost:8000
- Frontend at http://localhost:5173
- PostgreSQL database
- Redis cache
- MinIO storage

## API Usage

### Create Static QR Code

```bash
curl -X POST http://localhost:8000/qr \
  -H "Content-Type: application/json" \
  -d '{
    "type": "static",
    "content": "https://example.com",
    "name": "My QR Code",
    "formats": ["png", "svg"]
  }'
```

### Create Dynamic QR Code

```bash
curl -X POST http://localhost:8000/qr \
  -H "Content-Type: application/json" \
  -d '{
    "type": "dynamic",
    "target": "https://example.com",
    "name": "Dynamic QR"
  }'
```

### Update Dynamic QR Target

```bash
curl -X PUT http://localhost:8000/qr/{id}/target \
  -H "Content-Type: application/json" \
  -d '{
    "target": "https://new-url.com",
    "password": "secret123",
    "expiry_at": "2024-12-31T23:59:59"
  }'
```

### Bulk QR Creation

```bash
# Create CSV file with headers: name,type,content,target
curl -X POST http://localhost:8000/qr/bulk \
  -F "file=@qr_codes.csv"
```

### Get Analytics

```bash
curl http://localhost:8000/analytics/qr/{id}/summary?range=last_30d
```

## Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

Test coverage includes:
- QR code creation (static & dynamic)
- Redirect functionality with password protection
- Rate limiting for wrong passwords
- Expiry handling
- Bulk operations
- Analytics

### Frontend Tests

```bash
cd frontend
npm test
```

## Key Requirements Met

✅ **Dynamic QR images encode absolute redirect URL** `{BASE_URL}/r/{code}`  
✅ **Rate limiting** for wrong passwords (5 attempts per minute) → 429  
✅ **OpenAPI 3.1.0** specification consistent with routes  
✅ **Docker setup** with backend:8000 and frontend:5173  
✅ **SQLite for tests** - no external dependencies  
✅ **Deterministic code** - no sleeps or random logic  

### Test Scenarios Covered

- ✅ Create static QR → fetch PNG & SVG → 200
- ✅ Dynamic QR → /r/{code} → 302 → update target → 302 new
- ✅ Set password → 401 then 302 with password
- ✅ Set expiry 0 → 410 Gone
- ✅ Analytics summarizes ≥ 2 scans
- ✅ Bulk with 2 rows returns ZIP with 2 PNG + result.csv
- ✅ Frontend Home renders tagline

## Architecture

### Backend (FastAPI)
- **app/main.py**: Main FastAPI application
- **app/models.py**: SQLAlchemy database models
- **app/schemas.py**: Pydantic request/response schemas
- **app/repo.py**: Database repository layer
- **app/services/**: Business logic services
  - `qrcode.py`: QR code generation
  - `redirect.py`: Redirect handling with rate limiting
  - `bulk.py`: Bulk operations
  - `analytics.py`: Analytics processing

### Frontend (React + Vite)
- **src/pages/Home.jsx**: Landing page with tagline
- **src/pages/QrList.jsx**: QR code management
- **src/pages/QrCreate.jsx**: QR code creation form
- **Vite proxy setup** for API calls to backend

### Database Schema
- `qr_codes`: QR code metadata and configuration
- `scans`: Scan events for analytics
- `rate_limits`: Rate limiting for password attempts

## Configuration

Environment variables:
- `DATABASE_URL`: Database connection string
- `BASE_URL`: Base URL for QR redirects (default: http://localhost:8000)
- `SECRET_KEY`: JWT secret key
- `UPLOAD_DIR`: Directory for file uploads

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI spec: http://localhost:8000/openapi.json

## Production Deployment

For production:
1. Set environment variables appropriately
2. Use PostgreSQL instead of SQLite
3. Set up Redis for caching and rate limiting
4. Configure MinIO or S3 for file storage
5. Use nginx for static file serving
6. Set up SSL/TLS termination

## License

Copyright © 2025 - QRCode Builder v2