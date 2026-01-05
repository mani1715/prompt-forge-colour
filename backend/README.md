# Backend - Prompt Forge API

FastAPI backend service for the Prompt Forge platform.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- MongoDB running locally or MongoDB Atlas connection

### Setup

1. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Run the server**
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

### API Access
- **Base URL:** http://localhost:8001
- **API Endpoints:** http://localhost:8001/api/
- **Health Check:** http://localhost:8001/

---

## 📁 Directory Structure

```
backend/
├── server.py              # Main FastAPI application
├── database.py            # MongoDB connection setup
├── auto_init.py           # Automatic initialization on startup
├── requirements.txt       # Python dependencies
├── .env.example           # Environment template
│
├── auth/                  # Authentication & authorization
│   ├── __init__.py
│   ├── jwt.py            # JWT token handling
│   └── password.py       # Password hashing
│
├── routes/                # API route handlers
│   ├── __init__.py
│   ├── auth.py           # Admin authentication
│   ├── client_auth.py    # Client authentication
│   ├── projects.py       # Portfolio projects
│   ├── services.py       # Services management
│   ├── blogs.py          # Blog system
│   ├── contacts.py       # Contact form
│   ├── testimonials.py   # Testimonials
│   ├── bookings.py       # Booking system
│   └── ... (30+ routes)
│
├── models/                # Data models
│   ├── __init__.py
│   ├── admin.py
│   ├── client.py
│   └── project.py
│
├── schemas/               # Pydantic validation schemas
│   ├── __init__.py
│   ├── admin.py
│   ├── auth.py
│   └── project.py
│
├── utils/                 # Shared utilities
│   ├── __init__.py
│   └── helpers.py
│
└── scripts/               # Maintenance & utility scripts
    ├── seed/              # Database seeding
    │   ├── seed_complete_portfolio.py
    │   ├── seed_demo_data.py
    │   └── seed_database.py
    ├── init/              # Initialization
    │   ├── create_super_admin.py
    │   ├── create_admin.py
    │   └── init_booking_settings.py
    └── maintenance/       # Cleanup & updates
        ├── clean_duplicate_projects.py
        └── update_clients_schema.py
```

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication with two separate flows:

### Admin Authentication
- **Login:** `POST /api/auth/login`
- **Protected Routes:** Requires `Authorization: Bearer <token>` header
- **Role:** `super_admin` or `admin`

### Client Authentication
- **Login:** `POST /api/client-auth/login`
- **Protected Routes:** Requires `Authorization: Bearer <token>` header
- **Role:** `client`

---

## 🗄️ Database

### Connection
- **Driver:** Motor (async MongoDB driver)
- **Local:** `mongodb://localhost:27017`
- **Production:** MongoDB Atlas connection string

### Collections
```python
# Core Collections
admins_collection              # Admin users
clients_collection            # Client users
projects_collection           # Portfolio projects
client_projects_collection    # Client-specific projects

# Content Collections
blogs_collection              # Blog posts
services_collection           # Services offered
testimonials_collection       # Testimonials
page_content_collection       # Dynamic page content

# System Collections
contacts_collection           # Contact form submissions
bookings_collection          # Meeting bookings
booking_settings_collection  # Booking configuration
newsletter_collection        # Newsletter subscribers
analytics_collection         # Analytics data
storage_collection           # File metadata
```

### Seeding the Database

```bash
# Complete portfolio seed
python scripts/seed/seed_complete_portfolio.py

# Demo data with clients
python scripts/seed/seed_demo_data.py

# Basic database initialization
python scripts/seed/seed_database.py
```

---

## 🛣️ API Routes

### Public Routes (No Authentication)
- `GET /` - Health check
- `GET /api/` - API status
- `GET /api/services/` - List services
- `GET /api/projects/` - List portfolio projects
- `GET /api/blogs/` - List blog posts
- `GET /api/testimonials/` - List testimonials
- `POST /api/contacts/` - Submit contact form
- `POST /api/bookings/` - Create booking
- `POST /api/auth/login` - Admin login
- `POST /api/client-auth/login` - Client login

### Admin Protected Routes
All routes under:
- `/api/admin/*` - Admin panel operations
- `/api/admins/*` - Admin user management
- `/api/services/*` (POST, PUT, DELETE)
- `/api/projects/*` (POST, PUT, DELETE)
- `/api/blogs/*` (POST, PUT, DELETE)
- `/api/testimonials/*` (POST, PUT, DELETE)
- `/api/bookings/*` (GET, PUT, DELETE)
- `/api/booking-settings/*`
- `/api/clients/*`
- `/api/admin-client-projects/*`

### Client Protected Routes
- `/api/client-projects/*` - Client's own projects
- `/api/client-auth/me` - Current client info

---

## 🔧 Configuration

### Environment Variables

```env
# Database (Required)
MONGODB_URI=mongodb://localhost:27017
DB_NAME=mspn_dev_db

# Security (Required)
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000

# Server (Optional)
PORT=8001
TRUST_PROXY=false

# Email (Optional)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-password

# Storage (Optional)
# AWS_ACCESS_KEY_ID=your-key
# AWS_SECRET_ACCESS_KEY=your-secret
# AWS_BUCKET_NAME=your-bucket
# AWS_REGION=us-east-1
```

### CORS Configuration
Set `CORS_ORIGINS` to comma-separated list of allowed origins:
```env
# Development
CORS_ORIGINS=http://localhost:3000

# Production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🧪 Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/backend/backend_test.py

# Run with coverage
pytest --cov=. --cov-report=html
```

---

## 📦 Dependencies

### Core
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `motor` - Async MongoDB driver
- `pymongo` - MongoDB driver
- `pydantic` - Data validation

### Authentication
- `PyJWT` - JWT tokens
- `python-jose` - JWT encryption
- `bcrypt` - Password hashing
- `passlib` - Password utilities

### Utilities
- `python-dotenv` - Environment variables
- `requests` - HTTP client
- `python-multipart` - File uploads
- `email-validator` - Email validation

### Cloud (Optional)
- `boto3` - AWS SDK
- `botocore` - AWS core

### Development
- `pytest` - Testing framework
- `black` - Code formatter
- `flake8` - Linter
- `mypy` - Type checker
- `isort` - Import sorter

---

## 📝 Development Guidelines

### Adding New Routes

1. Create route file in `/routes`
2. Define Pydantic schemas in `/schemas`
3. Import and include router in `server.py`

Example:
```python
# routes/my_feature.py
from fastapi import APIRouter, Depends
from schemas.my_feature import MyFeatureSchema

router = APIRouter(prefix="/my-feature", tags=["my-feature"])

@router.get("/")
async def get_items():
    return {"items": []}

# server.py
from routes.my_feature import router as my_feature_router
api_router.include_router(my_feature_router)
```

### Database Operations

```python
from database import my_collection

# Insert
await my_collection.insert_one({"key": "value"})

# Find
result = await my_collection.find_one({"key": "value"})

# Update
await my_collection.update_one(
    {"_id": doc_id},
    {"$set": {"key": "new_value"}}
)

# Delete
await my_collection.delete_one({"_id": doc_id})
```

### Adding Dependencies

```bash
# Install new package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt
```

---

## 🚢 Production Deployment

### Preparation
1. Set production environment variables
2. Generate secure `SECRET_KEY`
3. Configure MongoDB Atlas
4. Update `CORS_ORIGINS`
5. Set `TRUST_PROXY=true` if behind proxy

### Start Command
```bash
uvicorn server:app --host 0.0.0.0 --port $PORT --workers 4
```

### Health Check Endpoint
```bash
curl http://your-domain.com/
# Should return: {"status": "healthy", "service": "Prompt Forge API"}
```

---

## 📚 Additional Documentation

- [API Documentation](/docs/api/)
- [Deployment Guide](/docs/deployment/DEPLOYMENT_GUIDE.md)
- [Main README](/README.md)

---

**Last Updated:** December 30, 2025
