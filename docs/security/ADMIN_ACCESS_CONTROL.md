# Admin Access Control

This document explains how the admin access control system works and how to add new admin users.

## Overview

The system uses a multi-layered approach to protect admin pages and functionality:

1. **Frontend Protection**: Client-side JavaScript prevents non-admins from accessing admin pages
2. **Backend Protection**: Server-side middleware validates admin privileges for all admin API endpoints
3. **Centralized Configuration**: Admin emails are managed in a single location

## Architecture

### Backend Components

- **`backend/config/admins.js`**: Centralized list of admin email addresses
- **`backend/middleware/firebaseAdminAuth.js`**: Middleware that validates Firebase tokens and checks admin status
- **`backend/routes/admin.js`**: Admin-specific API endpoints
- All admin routes use `firebaseAdminAuth` middleware to enforce admin-only access

### Frontend Components

- **`public/admin-guard.js`**: Client-side script that redirects non-admins away from admin pages
- All admin HTML pages (`/public/admin/*.html`) include the admin guard script
- **`public/auth.js`**: Shows/hides admin links in the navigation menu based on user role

## How to Add a New Admin

To grant admin access to a new user, follow these steps:

### Step 1: Update Backend Configuration

1. Open `backend/config/admins.js`
2. Add the new admin's email address (in lowercase) to the `ADMIN_EMAILS` array:

```javascript
const ADMIN_EMAILS = [
  'shaunessy24@gmail.com',
  'bonnielassflorals@gmail.com',
  'newemail@example.com'  // Add new admin email here
];
```

3. Save the file

### Step 2: Update Frontend Configuration

1. Open `public/admin-guard.js`
2. Add the same email address to the `ADMIN_EMAILS` array:

```javascript
const ADMIN_EMAILS = [
  'shaunessy24@gmail.com',
  'bonnielassflorals@gmail.com',
  'newemail@example.com'  // Add new admin email here
];
```

3. Save the file

### Step 3: Update Auth Script

1. Open `public/auth.js`
2. Find the `handleLogin` function and add the same email to the `admins` array:

```javascript
const admins = ["shaunessy24@gmail.com", "bonnielassflorals@gmail.com", "newemail@example.com"];
```

3. Save the file

### Step 4: Restart the Backend Server

The backend server must be restarted for the changes to take effect:

```bash
cd backend
npm start
```

Or if deployed on Render.com or similar platform, redeploy the backend service.

### Step 5: Clear Browser Cache (if needed)

If the frontend is cached, users may need to clear their browser cache or do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R) to load the updated scripts.

## Admin Pages

The following pages are protected and only accessible to admins:

- `/admin/upload.html` - Upload and manage products
- `/admin/orders.html` - View all customer orders
- `/admin/palette.html` - Customize site theme and colors

## Admin API Endpoints

The following API endpoints require admin authentication:

### Products
- `POST /api/products` - Create a new product
- `POST /api/products/batch` - Batch upload products via CSV
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Orders
- `GET /api/orders` - Get all orders (admin only)
- `PATCH /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete an order

### Settings
- `POST /api/settings/theme` - Save site theme
- `POST /api/settings/presets` - Save theme preset
- `DELETE /api/settings/presets/:id` - Delete theme preset
- `POST /api/settings/background` - Save background image
- `DELETE /api/settings/background` - Remove background image

### Admin
- `GET /api/admin/check` - Check if current user is admin

## Security Notes

- Admin emails must match exactly (case-insensitive comparison is performed)
- Users must be authenticated with Firebase before admin checks are performed
- All admin API endpoints validate the Firebase token and admin status on every request
- Client-side protection redirects unauthorized users immediately
- Server-side protection prevents API abuse even if client-side protection is bypassed

## Troubleshooting

### User Can't Access Admin Pages After Being Added

1. Verify the email is added to all three locations (backend config, admin-guard.js, auth.js)
2. Ensure the email is lowercase and matches exactly
3. Confirm the backend server was restarted
4. Check if the user is logged in with the correct email address
5. Clear browser cache and reload the page

### Admin Pages Show Briefly Then Redirect

This is expected behavior. The admin guard script checks authentication status after the page loads. There may be a brief flash before Firebase confirms the user's identity. To minimize this:

1. Ensure Firebase SDK scripts are loaded early in the page
2. The admin guard script runs as soon as Firebase is available
3. Consider adding a loading screen if the flash is noticeable

## Future Improvements

Consider these enhancements for production systems:

1. Store admin emails in environment variables or a database
2. Add role-based access control (e.g., admin, moderator, viewer)
3. Create an admin management UI for adding/removing admins
4. Add audit logging for admin actions
5. Implement 2FA for admin accounts
