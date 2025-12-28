# Quick Start Guide - Your Portfolio Management System

## 🚀 Access Your Application

**Live URL:** https://codebase-19.preview.emergentagent.com

### Admin Panel Login
**URL:** https://codebase-19.preview.emergentagent.com/admin/login

```
Username: admin
Password: admin123
```

⚠️ **Important:** Change this password after first login!

---

## ✅ What's Been Fixed

### The Problem You Had:
```
❌ Mixed Content: The page at 'https://...' was loaded over HTTPS, 
   but requested an insecure XMLHttpRequest endpoint 'http://...'
   This request has been blocked
```

### The Solution Applied:
✅ Updated API configuration to automatically use HTTPS when page is loaded over HTTPS
✅ All API calls now work correctly
✅ No more mixed content errors
✅ Client management works
✅ Client projects work
✅ File uploads work
✅ Chat messaging works

---

## 📱 How to Use Your Application

### 1. Create Your First Client

1. Login to Admin Panel
2. Navigate to **Clients** (left sidebar)
3. Click **"Add Client"** button
4. Fill in the form:
   ```
   Name: John Doe
   Email: john@example.com
   Password: client123
   Company: ABC Corp (optional)
   Phone: +1234567890 (optional)
   Account Active: ✓ (checked)
   ```
5. Click **"Create Client"**
6. ✅ Done! Client created successfully

### 2. Create a Project for Your Client

1. Navigate to **Client Projects** (left sidebar)
2. Click **"Add Project"** button
3. Fill in the project details:
   ```
   Project Name: Website Redesign
   Client: Select "John Doe" from dropdown
   Description: Complete website redesign with modern UI
   Status: In Progress
   Priority: High
   Progress: 30%
   Expected Delivery: (select a date)
   Notes: Project kick-off meeting scheduled
   ```
4. Click **"Create Project"**
5. ✅ Project created and assigned to client!

### 3. Manage Project Details

Once you select a project, you'll see multiple tabs:

#### **Overview Tab**
- View project status, progress, description
- See expected delivery date
- View notes

#### **Milestones Tab**
- Click "Add Milestone"
- Example:
  ```
  Title: Design Phase Complete
  Description: All mockups approved
  Due Date: (select date)
  Status: In Progress
  ```

#### **Tasks Tab**
- Click "Add Task"
- Example:
  ```
  Title: Homepage design
  Description: Create responsive homepage design
  Status: In Progress
  Priority: High
  Due Date: (select date)
  ```

#### **Team Tab**
- Add team members to the project
- Assign roles (Project Manager, Developer, etc.)

#### **Budget Tab**
- Set project budget
  ```
  Total Amount: 5000
  Currency: USD
  Paid Amount: 2000
  Payment Terms: 50% upfront, 50% on completion
  ```

#### **Files Tab**
- Upload project files
- Click "Upload File" → Select file → Done!
- Files are stored securely
- Can delete files anytime

#### **Activity Tab**
- View all project activities
- Automatic logging of changes
- Track who did what and when

#### **Chat Tab**
- Communicate with clients
- Type message → Click Send
- Messages are stored and visible to client

---

## 🔧 Technical Details

### Your Stack:
- **Frontend:** React 19 + Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Authentication:** JWT tokens
- **File Storage:** Local filesystem

### API Structure:
All API endpoints are prefixed with `/api`

**Admin Endpoints:**
- `/api/admins/login` - Admin authentication
- `/api/admin/clients/` - Client management
- `/api/admin/client-projects/` - Project management

**Client Portal Endpoints:**
- `/api/client/auth/login` - Client login
- `/api/client/projects/` - View assigned projects

### Services Running:
```
✅ MongoDB    → Port 27017
✅ Backend    → Port 8001
✅ Frontend   → Port 3000
✅ Nginx      → Proxy
```

---

## 🎯 Common Tasks

### Add Multiple Clients Quickly
1. Go to Clients page
2. For each client:
   - Click "Add Client"
   - Fill details
   - Click "Create"
3. Repeat as needed

### Bulk Update Project Status
1. Go to Client Projects
2. Select a project
3. Edit button → Change status → Update
4. Repeat for other projects

### Upload Multiple Files
1. Select project
2. Go to Files tab
3. Upload files one by one
4. Each upload is immediate

### Track Project Progress
1. Update progress percentage regularly
2. Add milestones for key phases
3. Create tasks for deliverables
4. Log activities automatically

---

## 🔐 Security Best Practices

1. **Change Default Password:**
   - Login with default credentials
   - Go to profile/settings
   - Update password immediately

2. **Create Role-Based Admins:**
   - Don't share super admin account
   - Create separate admin accounts
   - Assign specific permissions

3. **Regular Backups:**
   - MongoDB data is in `/data/db`
   - Uploaded files are in `/app/backend/uploads/client_projects`

4. **Monitor Access:**
   - Check activity logs regularly
   - Review who accessed what

---

## 📊 Dashboard Overview

Your admin dashboard shows:
- Total clients
- Active projects
- Pending tasks
- Recent activities
- Analytics (if enabled)

Navigate using the left sidebar menu.

---

## 🐛 Troubleshooting

### Issue: Can't login
**Solution:**
1. Clear browser cache (Ctrl+Shift+R)
2. Check credentials: `admin` / `admin123`
3. Verify you're on `/admin/login` not `/login`

### Issue: API errors in console
**Solution:**
1. Check browser console for details
2. Verify you see: `[API Request] Using HTTPS URL: https://...`
3. If still HTTP, clear cache and refresh

### Issue: File upload fails
**Solution:**
1. Check file size (max recommended: 10MB)
2. Ensure project is selected
3. Check backend logs: `tail -f /var/log/supervisor/backend.err.log`

### Issue: Changes not saving
**Solution:**
1. Check network tab in DevTools (F12)
2. Verify API calls return 200 status
3. Check if token is expired (logout and login again)

---

## 📞 Need Help?

### Check Logs:
```bash
# Backend errors
tail -f /var/log/supervisor/backend.err.log

# Frontend errors  
tail -f /var/log/supervisor/frontend.err.log

# All services status
sudo supervisorctl status
```

### Restart Services:
```bash
# Restart backend
sudo supervisorctl restart backend

# Restart frontend
sudo supervisorctl restart frontend

# Restart all
sudo supervisorctl restart all
```

### Test API Directly:
```bash
# Test admin login
curl -X POST http://localhost:8001/api/admins/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test health
curl http://localhost:8001/api/
```

---

## 🎉 You're All Set!

Your portfolio management system is now fully operational with:

✅ **Admin Panel** - Full control over clients and projects
✅ **Client Portal** - Clients can view their projects
✅ **Project Management** - Milestones, tasks, budgets
✅ **File Sharing** - Upload and manage project files
✅ **Real-time Chat** - Communicate with clients
✅ **Activity Tracking** - Know who did what
✅ **Secure Authentication** - JWT-based security
✅ **HTTPS Ready** - No mixed content errors

**Start by creating your first client and project!** 🚀

---

**Quick Links:**
- Admin Login: https://codebase-19.preview.emergentagent.com/admin/login
- Client Login: https://codebase-19.preview.emergentagent.com/client/login
- Main Site: https://codebase-19.preview.emergentagent.com

**Documentation:**
- Full fix details: `/app/MIXED_CONTENT_FIX_COMPLETE.md`
- This guide: `/app/QUICK_START_GUIDE.md`
