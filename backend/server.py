from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from database import close_db_connection
import asyncio
import subprocess

# Import all routers
from routes import (
    auth_router,
    pages_router,
    services_router,
    projects_router,
    contacts_router,
    settings_router,
    admins_router,
    storage_router,
    skills_router,
    content_router,
    notes_router,
    about_router,
    chat_router,
    blogs_router,
    newsletter_router,
    analytics_router
)
from routes.contact_page import router as contact_page_router
from routes.testimonials import router as testimonials_router
from routes.pricing import router as pricing_router
# Client Portal Routers
from routes.client_auth import router as client_auth_router
from routes.admin_clients import router as admin_clients_router
from routes.admin_client_projects import router as admin_client_projects_router
from routes.client_projects import router as client_projects_router
# Booking Routers
from routes.bookings import router as bookings_router
from routes.booking_settings import router as booking_settings_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# =============================================================================
# RENDER DEPLOYMENT CONFIGURATION
# =============================================================================
# Render will provide the PORT environment variable automatically
# For local development, it defaults to 8001
# 
# START COMMAND FOR RENDER:
# uvicorn server:app --host 0.0.0.0 --port $PORT
#
# This allows the application to:
# 1. Bind to all network interfaces (0.0.0.0)
# 2. Use the port provided by Render's environment
# 3. Work seamlessly in both development and production
# =============================================================================

PORT = int(os.environ.get("PORT", 8001))

# Create the main app without a prefix
app = FastAPI(
    title="MSPN DEV API",
    description="Backend API for MSPN DEV website and admin panel",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# =============================================================================
# ROOT HEALTH CHECK ENDPOINT (Required by Render)
# =============================================================================
# Render uses this endpoint to verify that the service is running correctly
# This must return a 200 OK status for the health check to pass
# =============================================================================
@app.get("/")
async def health_check():
    """Root health check endpoint for Render deployment monitoring"""
    return {
        "status": "healthy",
        "service": "MSPN DEV API",
        "message": "Backend is running successfully"
    }

# Health check endpoint under /api prefix (for backward compatibility)
@api_router.get("/")
async def root():
    return {"message": "MSPN DEV API is running", "status": "healthy"}

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(pages_router)
api_router.include_router(services_router)
api_router.include_router(projects_router)
api_router.include_router(contacts_router)
api_router.include_router(settings_router)
api_router.include_router(admins_router)
api_router.include_router(storage_router)
api_router.include_router(skills_router)
api_router.include_router(content_router)
api_router.include_router(notes_router)
api_router.include_router(about_router)
api_router.include_router(contact_page_router)
api_router.include_router(chat_router)
api_router.include_router(blogs_router)
api_router.include_router(testimonials_router, prefix="/testimonials", tags=["testimonials"])
api_router.include_router(newsletter_router)
api_router.include_router(pricing_router)
api_router.include_router(analytics_router)
# Client Portal Routers
api_router.include_router(client_auth_router)
api_router.include_router(admin_clients_router)
api_router.include_router(admin_client_projects_router)
api_router.include_router(client_projects_router)
# Booking Routers
api_router.include_router(bookings_router)
api_router.include_router(booking_settings_router)

# Include the main API router in the app
app.include_router(api_router)

# CORS configuration - Allow specific origins for development
cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins == '*':
    # When credentials are true, we need to specify origins explicitly
    allow_origins = [
        "http://localhost:3000",
        "https://newcode-dev.preview.emergentagent.com",
        "https://newcode-dev.preview.emergentagent.com",
        "https://newcode-dev.preview.emergentagent.com",
        "https://newcode-dev.preview.emergentagent.com"
    ]
    allow_credentials = True
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(',')]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize admin and default data on startup"""
    try:
        logger.info("🚀 Starting application initialization...")
        
        # Run auto-initialization for portfolio and services
        from auto_init import auto_initialize_database
        await auto_initialize_database()
        
        from database import admins_collection, contact_page_collection
        from auth.password import hash_password
        import uuid
        from datetime import datetime
        
        # Initialize Super Admin
        logger.info("Checking for super admin...")
        
        existing_admin = await admins_collection.find_one({"role": "super_admin"})
        
        if not existing_admin:
            # Create default super admin
            admin_user = {
                "id": str(uuid.uuid4()),
                "username": "admin",
                "password_hash": hash_password("admin123"),
                "role": "super_admin",
                "permissions": {
                    "canManageAdmins": True,
                    "canManageAbout": True,
                    "canManagePortfolio": True,
                    "canManageBlogs": True,
                    "canManageTestimonials": True,
                    "canManageDemos": True,
                    "canViewContacts": True,
                    "canManageContactPage": True,
                    "canManageChat": True,
                    "canManageNewsletter": True,
                    "canManageBookings": True,
                    "canManageBookingSettings": True,
                    "canManagePricing": True,
                    "canViewAnalytics": True,
                    "canManageClients": True,
                    "canManageClientProjects": True,
                    "canAccessStorage": True,
                    "canManageNotes": True,
                    "canManageSettings": True,
                    "canViewPrivateProjects": True
                },
                "created_at": datetime.utcnow().isoformat(),
                "created_by": "system"
            }
            
            await admins_collection.insert_one(admin_user)
            logger.info("✅ Super admin created successfully!")
            logger.info("   Username: admin")
            logger.info("   Password: admin123")
            logger.info("   ⚠️  IMPORTANT: Change this password after first login!")
        else:
            logger.info("✅ Super admin already exists")
        
        # Initialize Contact Page Data
        logger.info("Checking for contact page data...")
        
        existing_contact_page = await contact_page_collection.find_one()
        
        if not existing_contact_page:
            # Import the default contact content function
            from routes.contact_page import get_default_contact_content
            
            default_contact = get_default_contact_content()
            default_contact['created_at'] = datetime.utcnow().isoformat()
            default_contact['created_by'] = 'system'
            
            await contact_page_collection.insert_one(default_contact)
            logger.info("✅ Contact page initialized with default content!")
        else:
            logger.info("✅ Contact page data already exists")
        
        # Initialize Booking Settings
        logger.info("Checking for booking settings...")
        
        from database import booking_settings_collection
        import pytz
        
        existing_booking_settings = await booking_settings_collection.find_one({})
        
        if not existing_booking_settings:
            IST = pytz.timezone('Asia/Kolkata')
            now = datetime.now(IST).isoformat()
            
            default_booking_settings = {
                "id": str(uuid.uuid4()),
                "available_days": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday"
                ],
                "time_slots": [
                    {"start_time": "10:00", "end_time": "11:00", "max_bookings": 1},
                    {"start_time": "11:00", "end_time": "12:00", "max_bookings": 1},
                    {"start_time": "14:00", "end_time": "15:00", "max_bookings": 1},
                    {"start_time": "15:00", "end_time": "16:00", "max_bookings": 1},
                    {"start_time": "16:00", "end_time": "17:00", "max_bookings": 1}
                ],
                "meeting_type": "Google Meet",
                "timezone": "Asia/Kolkata",
                "is_active": True,
                "created_at": now,
                "updated_at": now
            }
            
            await booking_settings_collection.insert_one(default_booking_settings)
            logger.info("✅ Booking settings initialized with default configuration!")
            logger.info("   Available Days: Monday - Friday")
            logger.info("   Time Slots: 10:00-17:00 (IST)")
            logger.info("   Meeting Type: Google Meet")
        else:
            logger.info("✅ Booking settings already exist")
        
        logger.info("✅ Application initialization complete!")
        
    except Exception as e:
        logger.warning(f"Could not initialize data: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_db_connection()