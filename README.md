# Prompt Forge - Portfolio & Business Management Platform

A comprehensive full-stack agency portfolio and business management platform built with FastAPI, React, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Configure environment
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   
   # Run database seeds (optional)
   python scripts/seed/seed_complete_portfolio.py
   
   # Start backend
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   yarn install
   
   # Configure environment
   cp .env.example .env
   # Edit .env if needed (default values work for local dev)
   
   # Start frontend
   yarn start
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001/api/
   - Admin Panel: http://localhost:3000/admin/login
   - Client Portal: http://localhost:3000/client/login

### Default Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **Change this password after first login!**

---

## 📁 Project Structure

```
/app/
├── README.md                    # This file
├── .python-version              # Python version (3.10)
├── .gitignore                   # Git ignore rules
│
├── backend/                     # FastAPI backend application
│   ├── server.py                # Main application entry point
│   ├── database.py              # MongoDB connection
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Environment template
│   ├── auth/                    # Authentication logic
│   ├── routes/                  # API endpoints
│   ├── models/                  # Data models
│   ├── schemas/                 # Pydantic schemas
│   ├── utils/                   # Shared utilities
│   └── scripts/                 # Maintenance & seed scripts
│       ├── seed/                # Database seed scripts
│       ├── init/                # Initialization scripts
│       └── maintenance/         # Cleanup & update scripts
│
├── frontend/                    # React frontend application
│   ├── package.json             # Node dependencies
│   ├── .nvmrc                   # Node version (18)
│   ├── .env.example             # Environment template
│   ├── public/                  # Static assets
│   └── src/
│       ├── App.js               # Main React component
│       ├── pages/               # Page components
│       ├── components/          # Reusable components
│       ├── admin/               # Admin panel
│       ├── demos/               # Demo showcases
│       ├── context/             # State management
│       ├── services/            # API services
│       └── lib/                 # Utilities
│
├── docs/                        # Project documentation
│   ├── architecture/            # Architecture docs
│   ├── deployment/              # Deployment guides
│   ├── development/             # Development guides
│   └── api/                     # API documentation
│
├── scripts/                     # Root-level utility scripts
│
├── tests/                       # Test files
│   ├── backend/                 # Backend tests
│   └── integration/             # Integration tests
│
└── archive/                     # Archived/legacy content
    ├── github_repo/             # Reference repository clone
    ├── temp_repo/               # Temporary files
    └── public/                  # Legacy assets
```

---

## 🎯 Key Features

### Public Website
- Home page with hero section
- About page with team information
- Services showcase
- Portfolio gallery (8+ projects)
- Blog system with rich content
- Contact form
- Testimonials display
- Newsletter subscription
- Live chat widget

### Admin Panel
- Comprehensive dashboard with analytics
- Content management system
- Portfolio project manager
- Blog editor with markdown support
- Client management
- Client project tracking (milestones, tasks, budgets)
- Booking system for meeting scheduling
- Testimonials manager
- Newsletter subscriber management
- Settings & user permissions
- File storage & uploads

### Client Portal
- Secure client authentication
- Project dashboard
- Milestone tracking
- Task management
- Budget overview
- Team member information
- File downloads
- Comment system
- Activity log
- Per-project chat

### Demo Showcases
- E-commerce Platform
- Corporate Website
- Learning Management System (LMS)
- Restaurant Booking System
- SaaS Landing Page
- Mobile Design System
- Real-Time Analytics Dashboard
- Social Media Management Tool

---

## 🔧 Development

### Backend Development

**Running the server:**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Database seeding:**
```bash
# Seed complete portfolio
python scripts/seed/seed_complete_portfolio.py

# Seed demo data
python scripts/seed/seed_demo_data.py

# Create admin user
python scripts/init/create_super_admin.py
```

**Adding dependencies:**
```bash
pip install package-name
pip freeze > requirements.txt
```

### Frontend Development

**Running the dev server:**
```bash
cd frontend
yarn start
```

**Adding dependencies:**
```bash
yarn add package-name
```

**Building for production:**
```bash
yarn build
```

---

## 📚 Documentation

Detailed documentation is available in the `/docs` directory:

- **Deployment Guides:** `/docs/deployment/`
  - DEPLOYMENT_GUIDE.md - Complete deployment instructions
  - DEPLOYMENT_READY.md - Deployment checklist

- **Development Guides:** `/docs/development/`
  - QUICK_START.md - Quick start guide
  - CLIENT_PROJECTS_COMPLETE_GUIDE.md - Client portal guide
  - DEBUG_GUIDE.md - Debugging tips

- **API Documentation:** `/docs/api/`
  - API_FIX_VERIFICATION.md - API testing guide

---

## 🌐 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017
DB_NAME=mspn_dev_db
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=your-secret-key-change-in-production
PORT=8001
TRUST_PROXY=false
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=/api
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
USE_WEBPACK_PROXY=true
```

See `.env.example` files for complete documentation.

---

## 🚢 Deployment

### Backend Deployment
- **Platforms:** Render, Railway, AWS, DigitalOcean
- **Database:** MongoDB Atlas (recommended)
- **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Frontend Deployment
- **Platforms:** Vercel, Netlify, AWS S3+CloudFront
- **Build Command:** `yarn build`
- **Output Directory:** `build`

Detailed deployment guides available in `/docs/deployment/`.

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
yarn test
```

---

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI
- **Database:** MongoDB with Motor (async driver)
- **Authentication:** JWT (PyJWT)
- **Validation:** Pydantic
- **Server:** Uvicorn

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (Radix UI primitives)
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **State:** React Context API
- **Build Tool:** Create React App + CRACO

### Database
- **Type:** NoSQL (MongoDB)
- **Driver:** Motor (async)
- **Production:** MongoDB Atlas

---

## 📝 License

[Add your license here]

---

## 🤝 Contributing

[Add contributing guidelines here]

---

## 📧 Contact

[Add contact information here]

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** December 30, 2025
