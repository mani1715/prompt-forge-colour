# Backend Scripts

Utility scripts for database seeding, initialization, and maintenance.

## 📁 Directory Structure

```
scripts/
├── seed/           # Database seeding scripts
├── init/           # Initialization scripts
└── maintenance/    # Cleanup and update scripts
```

---

## 🌱 Seed Scripts

Located in: `/backend/scripts/seed/`

### seed_complete_portfolio.py
**Purpose:** Seeds the database with a complete, production-ready portfolio dataset.

**Usage:**
```bash
cd /app/backend
python scripts/seed/seed_complete_portfolio.py
```

**What it seeds:**
- 8+ portfolio projects with full details
- Service offerings
- Skills and technologies
- Testimonials (if included)

**When to use:**
- Initial production setup
- After database reset
- Creating demo environment

---

### seed_demo_data.py
**Purpose:** Seeds demo data including clients and their projects.

**Usage:**
```bash
cd /app/backend
python scripts/seed/seed_demo_data.py
```

**What it seeds:**
- 3 demo client accounts
- Client projects with milestones
- Tasks and budget information
- Team members

**When to use:**
- Setting up development environment
- Creating demo/showcase environment
- Testing client portal features

---

### seed_database.py
**Purpose:** Basic database initialization with core collections.

**Usage:**
```bash
cd /app/backend
python scripts/seed/seed_database.py
```

**What it seeds:**
- Basic collections structure
- Minimal required data
- Default settings

**When to use:**
- First-time database setup
- Resetting to clean state

---

### seed_demo_projects.py
**Purpose:** Seeds additional demo portfolio projects.

**Usage:**
```bash
cd /app/backend
python scripts/seed/seed_demo_projects.py
```

**What it seeds:**
- Additional portfolio projects
- Variety of project types

**When to use:**
- Expanding portfolio examples
- Testing project features

---

### seed_portfolio_data.py
**Purpose:** Alternative portfolio seeding with different data set.

**Usage:**
```bash
cd /app/backend
python scripts/seed/seed_portfolio_data.py
```

**What it seeds:**
- Portfolio projects (alternative set)
- May overlap with seed_complete_portfolio.py

**When to use:**
- Alternative data scenarios
- Testing different portfolio layouts

---

### seed_client_projects_data.py
**Purpose:** Seeds client-specific project data.

**Usage:**
```bash
cd /app/backend
python scripts/seed/seed_client_projects_data.py
```

**What it seeds:**
- Client project structures
- Milestones and deliverables
- Timeline information

**When to use:**
- Testing client portal
- Setting up client demo accounts

---

## 🔧 Init Scripts

Located in: `/backend/scripts/init/`

### create_super_admin.py
**Purpose:** Creates a super admin user with full permissions.

**Usage:**
```bash
cd /app/backend
python scripts/init/create_super_admin.py
```

**What it does:**
- Creates admin user with role: `super_admin`
- Grants all permissions
- Sets default password (should be changed)

**When to use:**
- Initial setup
- Creating new super admin
- After admin account lockout

⚠️ **Important:** Change the default password immediately after creation!

---

### create_admin.py
**Purpose:** Creates a standard admin user with configurable permissions.

**Usage:**
```bash
cd /app/backend
python scripts/init/create_admin.py
```

**What it does:**
- Creates admin user with role: `admin`
- Configurable permissions
- Limited access compared to super admin

**When to use:**
- Adding team members
- Creating role-specific admins

---

### init_admin.py
**Purpose:** Alternative admin initialization script.

**Usage:**
```bash
cd /app/backend
python scripts/init/init_admin.py
```

**What it does:**
- Initializes admin account
- May check for existing admin

**When to use:**
- Automated setup processes
- CI/CD initialization

---

### create_demo_client_project.py
**Purpose:** Creates a comprehensive demo client project with all features.

**Usage:**
```bash
cd /app/backend
python scripts/init/create_demo_client_project.py
```

**What it does:**
- Creates full-featured client project
- Includes milestones, tasks, budget
- Team members and files
- Activity log entries

**When to use:**
- Demonstrating client portal
- Testing all project features
- Creating showcase accounts

---

### init_booking_settings.py
**Purpose:** Initializes booking system settings.

**Usage:**
```bash
cd /app/backend
python scripts/init/init_booking_settings.py
```

**What it does:**
- Sets up booking time slots
- Configures available days
- Sets meeting types
- Timezone configuration

**When to use:**
- Initial booking system setup
- Resetting booking configuration

---

## 🔨 Maintenance Scripts

Located in: `/backend/scripts/maintenance/`

### clean_duplicate_projects.py
**Purpose:** Removes duplicate project entries from database.

**Usage:**
```bash
cd /app/backend
python scripts/maintenance/clean_duplicate_projects.py
```

**What it does:**
- Identifies duplicate projects
- Removes duplicates based on criteria
- Preserves most recent version

**When to use:**
- After data migration
- Cleaning up test data
- Database maintenance

⚠️ **Warning:** Always backup database before running cleanup scripts!

---

### update_clients_schema.py
**Purpose:** Updates client collection schema to new format.

**Usage:**
```bash
cd /app/backend
python scripts/maintenance/update_clients_schema.py
```

**What it does:**
- Migrates client data to new schema
- Adds missing fields
- Updates data structure

**When to use:**
- After schema changes
- Database migrations
- Upgrading client features

⚠️ **Warning:** Test on development database first!

---

### update_demo_urls.py
**Purpose:** Updates URLs in demo data.

**Usage:**
```bash
cd /app/backend
python scripts/maintenance/update_demo_urls.py
```

**What it does:**
- Updates demo project URLs
- Fixes broken links
- Updates environment-specific URLs

**When to use:**
- After domain changes
- Updating demo environments
- Fixing demo data

---

## 📋 Recommended Execution Order

### First-Time Setup
```bash
# 1. Create super admin
python scripts/init/create_super_admin.py

# 2. Initialize booking settings
python scripts/init/init_booking_settings.py

# 3. Seed complete portfolio
python scripts/seed/seed_complete_portfolio.py

# 4. (Optional) Seed demo data
python scripts/seed/seed_demo_data.py
```

### Development Environment
```bash
# 1. Basic database setup
python scripts/seed/seed_database.py

# 2. Create admin
python scripts/init/create_super_admin.py

# 3. Add demo content
python scripts/seed/seed_demo_data.py
python scripts/seed/seed_demo_projects.py
```

### Production Environment
```bash
# 1. Create super admin only
python scripts/init/create_super_admin.py

# 2. Initialize required settings
python scripts/init/init_booking_settings.py

# 3. (Optional) Add initial portfolio
python scripts/seed/seed_complete_portfolio.py

# DO NOT run demo data in production!
```

---

## ⚠️ Important Notes

### Before Running Scripts
1. **Backup your database** - Always backup before running seed or maintenance scripts
2. **Check environment** - Ensure you're running in the correct environment
3. **Review script contents** - Understand what data will be added/modified
4. **Check for duplicates** - Some scripts may create duplicates if run multiple times

### Script Behavior
- Most seed scripts are **idempotent** - safe to run multiple times
- Some scripts will **skip** if data already exists
- Others may **append** new data without checking for duplicates
- Maintenance scripts may **modify or delete** existing data

### Database Connection
All scripts use the MongoDB connection from `database.py`:
- Reads `MONGODB_URI` from `.env`
- Uses `DB_NAME` from `.env`
- Ensure backend `.env` is configured correctly

---

## 🔍 Checking Script Results

### Via MongoDB Shell
```bash
# Connect to MongoDB
mongo

# Use your database
use mspn_dev_db

# Check collections
show collections

# Count documents
db.projects.count()
db.admins.count()
db.clients.count()

# View sample documents
db.projects.findOne()
```

### Via Backend API
```bash
# Check projects
curl http://localhost:8001/api/projects/

# Check services
curl http://localhost:8001/api/services/

# Check if admin exists (requires auth)
curl -H "Authorization: Bearer <token>" http://localhost:8001/api/admins/
```

---

## 🐛 Troubleshooting

### Script Fails to Run
**Error:** `ModuleNotFoundError`
- Ensure you're in the backend directory
- Activate virtual environment
- Install requirements: `pip install -r requirements.txt`

**Error:** `MongoDB connection failed`
- Check MongoDB is running
- Verify `MONGODB_URI` in `.env`
- Check network connectivity

**Error:** `Permission denied`
- Check file permissions
- Run with appropriate user

### Script Creates Duplicates
- Check if script is idempotent
- Review script logic
- Use cleanup scripts if needed
- Consider database reset

### Script Doesn't Add Expected Data
- Check script output/logs
- Verify database connection
- Check for errors in script
- Review script logic

---

## 📚 Additional Resources

- [Backend README](../README.md) - Backend documentation
- [Main README](../../README.md) - Project overview
- [Database Documentation](../database.py) - Database connection info

---

**Last Updated:** December 30, 2025
