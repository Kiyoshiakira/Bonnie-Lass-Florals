# Messages System Configuration Guide

This guide explains how to configure and use the new real messages system for contact form submissions.

## Overview

The messages system provides:
- Persistent storage of contact form submissions in MongoDB
- Email notifications to admin users when new messages arrive
- Admin-only UI for viewing, managing, and responding to messages
- Rate limiting to prevent abuse
- Secure authentication using Firebase Admin SDK

## Required Environment Variables

### Database (Required)
These variables should already be configured:
- `MONGO_URI` - MongoDB connection string

### Email Notifications (Optional)

If you want to receive email notifications when users submit contact forms, configure these SMTP settings:

```bash
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com              # Your SMTP server hostname
SMTP_PORT=587                         # SMTP port (587 for TLS, 465 for SSL)
SMTP_SECURE=false                     # Set to 'true' for port 465, 'false' for other ports
SMTP_USER=your-email@gmail.com        # SMTP username (usually your email)
SMTP_PASS=your-app-password           # SMTP password or app-specific password

# Email Settings
EMAIL_FROM="Bonnie Lass Florals <noreply@bonnielassflorals.com>"  # From address
ADMIN_EMAILS=admin1@example.com,admin2@example.com  # Comma-separated list of admin emails to notify
```

**Note:** If these variables are not configured, the system will still work but email notifications will be skipped. Messages will still be saved to the database.

### Gmail SMTP Setup

If using Gmail:
1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Use the app password for `SMTP_PASS` (not your regular Gmail password)

Example Gmail configuration:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=bonnielassflorals@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM="Bonnie Lass Florals <bonnielassflorals@gmail.com>"
ADMIN_EMAILS=shaunessy24@gmail.com,bonnielassflorals@gmail.com
```

## Render.com Configuration

To configure environment variables on Render.com:

1. Go to your service dashboard on Render
2. Navigate to "Environment" tab
3. Add each environment variable as a key-value pair
4. Click "Save Changes"
5. The service will automatically redeploy with the new configuration

## Admin Access

Admin users are defined in `backend/config/admins.js`:
```javascript
const ADMIN_EMAILS = [
  'shaunessy24@gmail.com',
  'bonnielassflorals@gmail.com'
];
```

To add more admin users:
1. Edit `backend/config/admins.js`
2. Add the admin's email address (lowercase) to the array
3. Commit and deploy the changes

## Using the Messages Admin UI

### Accessing the Messages Page

1. Log in as an admin user (email must be in the admin list)
2. Click on your profile circle in the top navigation
3. Select "Messages" from the dropdown menu
4. You'll be redirected to `/admin/messages.html`

### Features

- **View Messages**: See all contact form submissions in a table
- **Unread Badge**: Shows the count of unread messages
- **Mark Read/Unread**: Click the button to toggle message status
- **Delete Messages**: Remove messages you no longer need
- **Refresh**: Reload messages without refreshing the page
- **Message Details**: 
  - Sender name and email
  - Message content
  - Submission timestamp
  - Read/unread status (unread messages are highlighted)

## API Endpoints

### Public Endpoint

**POST /api/contact**
- Submit a new contact form message
- Rate limited: 5 requests per 15 minutes per IP
- Request body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I would like to order..."
  }
  ```
- Response:
  ```json
  {
    "message": "Message sent! Thank you for contacting us."
  }
  ```

### Admin-Only Endpoints

All admin endpoints require Firebase authentication with admin email:
- Header: `Authorization: Bearer <firebase-id-token>`

**GET /api/messages**
- List all messages
- Query params: `?limit=10&unread=true`
- Rate limited: 100 requests per 15 minutes per IP

**GET /api/messages/unread-count**
- Get count of unread messages
- Response: `{ "count": 5 }`

**PUT /api/messages/:id/read**
- Mark a message as read or unread
- Request body: `{ "read": true }`

**DELETE /api/messages/:id**
- Delete a message
- Response: `{ "message": "Message deleted successfully." }`

## Security Features

1. **Rate Limiting**:
   - Contact form: 5 submissions per 15 minutes per IP
   - Admin API: 100 requests per 15 minutes per IP

2. **Input Validation**:
   - Required fields checked
   - Email format validated
   - Protection against ReDoS attacks

3. **Authentication**:
   - Admin endpoints protected by Firebase Admin SDK
   - Only users with admin emails can access

4. **MongoDB Injection Protection**:
   - Using Mongoose ORM with schema validation
   - Input sanitization built into Mongoose

## Troubleshooting

### Email notifications not working
1. Check that all SMTP environment variables are set correctly
2. Verify SMTP credentials are valid
3. Check server logs for email errors (they won't block form submission)
4. For Gmail, ensure you're using an App Password, not your regular password

### Can't access messages page
1. Verify you're logged in
2. Check that your email is in the admin list (`backend/config/admins.js`)
3. Clear browser cache and try again
4. Check browser console for errors

### Messages not saving
1. Verify `MONGO_URI` is correctly configured
2. Check that MongoDB connection is established (check server logs)
3. Verify the database user has write permissions

### Rate limit errors
- If you're getting rate limit errors, wait 15 minutes and try again
- Rate limits are per IP address
- Limits are designed to prevent abuse while allowing normal usage

## Testing

### Test Contact Form
1. Visit the Contact page as a regular user
2. Fill out the form with valid information
3. Submit the form
4. Check for success message
5. Log in as admin and verify the message appears in the admin panel

### Test Email Notifications (if configured)
1. Submit a contact form
2. Check admin email inbox for notification
3. Verify all message details are included

### Test Admin Functions
1. Log in as an admin
2. Navigate to the Messages page
3. Test marking messages as read/unread
4. Test deleting a message
5. Verify unread count badge updates correctly

## Support

For issues or questions, contact the development team or check the project repository for updates.
