# Debug Guide - "Failed to add task" Error

## Step 1: Clear Browser Cache

**Very Important!** Your browser might be caching the old JavaScript files.

### Chrome/Edge:
1. Open the page: `https://dev-snippets.preview.emergentagent.com`
2. Press **Ctrl + Shift + Delete** (or Cmd + Shift + Delete on Mac)
3. Select "Cached images and files"
4. Select "All time"
5. Click "Clear data"
6. **OR** Do a hard refresh: **Ctrl + Shift + R** (Cmd + Shift + R on Mac)

### Firefox:
1. Press **Ctrl + Shift + Delete**
2. Select "Cache"
3. Click "Clear Now"
4. Hard refresh: **Ctrl + Shift + R**

## Step 2: Check Console for Errors

1. Open the admin panel: `https://dev-snippets.preview.emergentagent.com/admin/login`
2. Login with: `admin` / `admin123`
3. Open browser console: Press **F12** or **Ctrl + Shift + I**
4. Click on the "Console" tab
5. Clear the console: Click the 🚫 icon
6. Navigate to "Client Projects"
7. Select a project
8. Click "Tasks" tab
9. Click "Add Task" button
10. Fill in the form and try to save

## Step 3: What to Look For

### ✅ GOOD - You should see this in console:
```
[API Config] Environment: development
[API Config] REACT_APP_BACKEND_URL: /api
[API Config] Current origin: https://dev-snippets.preview.emergentagent.com
[API Config] Current protocol: https:
[API Config] ✅ Using absolute HTTPS URL: https://dev-snippets.preview.emergentagent.com/api
```

### ❌ BAD - If you see this:
```
Mixed Content: The page at 'https://...' was loaded over HTTPS, 
but requested an insecure XMLHttpRequest endpoint 'http://...'
```

This means browser cache is still serving old JavaScript.

### 🔍 Other Possible Errors:

#### Network Error
```
Network error: Network Error
```
**Cause**: CORS or connection issue
**Check**: Is backend running? CORS configured?

#### Authorization Error
```
401 Unauthorized
```
**Cause**: Token expired or invalid
**Fix**: Logout and login again

#### Validation Error
```
400 Bad Request: {detail: "..."}
```
**Cause**: Missing required fields or invalid data
**Fix**: Check all required fields are filled

## Step 4: Test API Directly

Open browser console and run this:

```javascript
// Test if API config is correct
console.log('Testing API configuration...');

// This should show the configured base URL
fetch('https://dev-snippets.preview.emergentagent.com/api/')
  .then(r => r.json())
  .then(data => console.log('✅ API Response:', data))
  .catch(e => console.error('❌ API Error:', e));
```

**Expected output:**
```
✅ API Response: {message: "MSPN DEV API is running", status: "healthy"}
```

## Step 5: Test Task Creation API

In browser console, after logging in:

```javascript
// Get auth token
const token = localStorage.getItem('admin_token') || localStorage.getItem('adminToken');
console.log('Auth token exists:', !!token);

// Test task creation endpoint (replace PROJECT_ID with actual project ID)
const PROJECT_ID = '78bb9c3e-6652-4afc-b352-f9585c9a5a7d'; // Your project ID

fetch(`https://dev-snippets.preview.emergentagent.com/api/admin/client-projects/${PROJECT_ID}/tasks`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Test Task',
    description: 'Testing task creation',
    status: 'todo',
    priority: 'medium'
  })
})
.then(r => r.text())
.then(data => console.log('✅ Task Creation Response:', data))
.catch(e => console.error('❌ Task Creation Error:', e));
```

## Step 6: Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Still seeing HTTP in requests | Clear browser cache completely + hard refresh |
| CORS error | Backend restarted? Check logs: `tail -f /var/log/supervisor/backend.err.log` |
| 401 Unauthorized | Logout and login again |
| Network timeout | Check backend is running: `sudo supervisorctl status backend` |
| "Failed to add task" (no details) | Open console, look for actual error message |

## Step 7: Force Reload Everything

If nothing works, try this **nuclear option**:

1. Close ALL browser tabs
2. Clear browser cache completely
3. Close browser completely
4. Reopen browser
5. Go to: `https://dev-snippets.preview.emergentagent.com/admin/login`
6. Try again

## Step 8: Try Incognito/Private Window

This will use a fresh cache:

1. Open **Incognito/Private** window
2. Go to: `https://dev-snippets.preview.emergentagent.com/admin/login`
3. Login
4. Try adding a task

If it works in incognito, the issue is definitely browser cache.

## Need More Help?

Share these details:

1. **Full console error** (copy and paste everything in red)
2. **Network tab**: 
   - Open F12 → Network tab
   - Try adding task
   - Click on the failed request
   - Share:
     - Request URL
     - Request Method
     - Status Code
     - Response body

---

**Services Status Check:**
```bash
sudo supervisorctl status
```

Should show:
- ✅ backend: RUNNING
- ✅ frontend: RUNNING
- ✅ mongodb: RUNNING

**Backend CORS Check:**
```bash
grep "CORS enabled" /var/log/supervisor/backend.err.log | tail -1
```

Should include: `https://dev-snippets.preview.emergentagent.com`
