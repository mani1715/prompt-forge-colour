from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import logging
from pathlib import Path

# Configure logging
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with production-ready configuration
# MONGODB_URI is the standard environment variable name used by MongoDB Atlas and Render
mongodb_uri = os.environ.get('MONGODB_URI')
db_name = os.environ.get('DB_NAME', 'mspn_dev_db')

# Validation: Ensure MongoDB URI is provided
if not mongodb_uri:
    logger.error("❌ MONGODB_URI environment variable is not set!")
    raise ValueError("MONGODB_URI environment variable is required. Please set it in your .env file or environment.")

# Log connection attempt (without exposing credentials)
if mongodb_uri.startswith('mongodb+srv://'):
    logger.info("🔗 Connecting to MongoDB Atlas (production)...")
elif mongodb_uri.startswith('mongodb://localhost'):
    logger.info("🔗 Connecting to local MongoDB (development)...")
else:
    logger.info("🔗 Connecting to MongoDB...")

try:
    # Create MongoDB client with connection timeout
    client = AsyncIOMotorClient(
        mongodb_uri,
        serverSelectionTimeoutMS=5000,  # 5 second timeout
        connectTimeoutMS=10000,  # 10 second connection timeout
    )
    db = client[db_name]
    logger.info(f"✅ MongoDB client initialized for database: {db_name}")
except Exception as e:
    logger.error(f"❌ Failed to initialize MongoDB client: {str(e)}")
    raise

# Collections
users_collection = db['users']
page_content_collection = db['page_content']
services_collection = db['services']
projects_collection = db['projects']
contacts_collection = db['contacts']
settings_collection = db['settings']
admins_collection = db['admins']
storage_collection = db['storage']
skills_collection = db['skills']
content_collection = db['content']
notes_collection = db['notes']
contact_page_collection = db['contact_page']
conversations_collection = db['conversations']
blogs_collection = db['blogs']
testimonials_collection = db['testimonials']
newsletter_collection = db['newsletter']
pricing_collection = db['pricing']
analytics_collection = db['analytics']
# Client Portal Collections
clients_collection = db['clients']
client_projects_collection = db['client_projects']
# Booking Collections
bookings_collection = db['bookings']
booking_settings_collection = db['booking_settings']

async def close_db_connection():
    client.close()
