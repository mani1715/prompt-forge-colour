# Quick Test Guide - Admin Panel Client Projects

## Access the Application

**Preview URL**: https://project-hub-231.preview.emergentagent.com

## Admin Login Credentials
- **URL**: https://project-hub-231.preview.emergentagent.com/admin/login
- **Username**: `admin`
- **Password**: `admin123`
- ⚠️ **Important**: Change this password after first login!

## Test Data Available
A test client and project have been created for testing:

### Test Client
- **Name**: Test Client
- **Email**: testclient@example.com
- **Company**: Test Company
- **Phone**: 1234567890

### Test Project
- **Name**: Test Project
- **Status**: In Progress
- **Priority**: High
- **Progress**: 50%
- **Current Budget**: $3,000 USD
  - Paid: $1,500
  - Pending: $1,500
  - Payment Terms: Net 90

## How to Test Budget Update

1. **Login to Admin Panel**
   - Go to: `/admin/login`
   - Enter credentials (admin/admin123)

2. **Navigate to Client Projects**
   - Click on "Client Projects" in the sidebar menu

3. **Select the Test Project**
   - Click on "Test Project" from the list

4. **Update Budget**
   - Click on the "Budget" tab or "Edit Budget" button
   - Change the values:
     - Total Amount: Try changing to any value (e.g., 5000)
     - Paid Amount: Try changing (e.g., 2000)
     - Currency: USD/EUR/GBP/INR
     - Payment Terms: Enter any terms
   - Click "Update" or "Save"
   - You should see a success message
   - The budget should be updated immediately

5. **Verify the Update**
   - Refresh the page or navigate away and back
   - The new budget values should be displayed
   - Check that pending amount is automatically calculated (Total - Paid)

## Other Features to Test

### Milestones
- Add new milestone
- Update existing milestone
- Mark milestone as complete
- Delete milestone

### Tasks
- Add new task
- Assign task to team member
- Update task status
- Change priority
- Delete task

### Team Members
- Add admin to project team
- Assign roles
- Remove team members

### Files
- Upload project files
- Download files
- Delete files

### Comments
- Add comments to project
- View comment history

### Chat
- Send messages to client
- View chat history
- Real-time communication

## Expected Behavior

✅ **Before the Fix**:
- Backend was not starting
- All API calls were failing
- No updates were being saved
- Error messages in console

✅ **After the Fix**:
- Backend running successfully
- All API endpoints working
- Budget updates saving correctly
- All CRUD operations functional
- Activity log tracking all changes

## API Endpoints (for developers)

### Budget Update Endpoint
```
PUT /api/admin/client-projects/{project_id}/budget
Headers: Authorization: Bearer {token}
Body: {
  "total_amount": 5000.0,
  "currency": "USD",
  "paid_amount": 2000.0,
  "payment_terms": "Net 30"
}
```

### Response
```json
{
  "total_amount": 5000,
  "currency": "USD",
  "paid_amount": 2000,
  "pending_amount": 3000,
  "payment_terms": "Net 30"
}
```

## Troubleshooting

If you encounter any issues:

1. **Check Backend Status**
   ```bash
   sudo supervisorctl status backend
   ```

2. **Check Backend Logs**
   ```bash
   tail -f /var/log/supervisor/backend.err.log
   ```

3. **Check Frontend Status**
   ```bash
   sudo supervisorctl status frontend
   ```

4. **Restart Services if Needed**
   ```bash
   sudo supervisorctl restart backend
   sudo supervisorctl restart frontend
   ```

5. **Check Database Connection**
   ```bash
   sudo supervisorctl status mongodb
   ```

## Notes

- All changes are persisted in MongoDB
- Activity log records all modifications
- Budget pending amount is automatically calculated
- All validations are in place
- Error messages are user-friendly
- Success toasts appear on successful operations

## Support

If you encounter any issues not covered in this guide, please check:
1. Browser console for JavaScript errors
2. Network tab for failed API calls
3. Backend logs for server errors
4. MongoDB connection status
