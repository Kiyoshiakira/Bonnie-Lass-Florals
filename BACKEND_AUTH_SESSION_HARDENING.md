# Backend Auth/Session Hardening

This document describes the session and Firebase Admin initialization improvements made to the backend.

## Overview

The backend has been hardened to ensure proper session management and centralized Firebase Admin SDK initialization. This prevents order-of-initialization bugs and ensures consistent authentication across all routes.

## Changes Made

### 1. Centralized Firebase Admin Initialization

**File:** `backend/utils/firebaseAdmin.js`

- Single source of truth for Firebase Admin SDK initialization
- Automatically initializes on module load
- Supports both service account JSON and application default credentials
- Prevents duplicate initialization issues

**Usage:**
```javascript
const admin = require('../utils/firebaseAdmin');
// admin is already initialized and ready to use
```

### 2. Express Session Configuration

**File:** `backend/index.js`

- Added `express-session` middleware with secure defaults
- Configured to use MongoStore when `MONGO_URI` is available for persistent sessions
- Falls back to MemoryStore with warning for development
- Session cookies configured with security best practices:
  - `httpOnly: true` - prevents XSS attacks
  - `secure: true` in production - requires HTTPS
  - `sameSite: 'lax'` - CSRF protection
  - 7-day expiration

### 3. Enhanced Auth Middleware

**File:** `backend/middleware/auth.js`

- Now sets both `req.user` (primary) and `req.session.user` (backward compatibility)
- Uses centralized Firebase Admin module
- Properly handles both session-based and JWT token authentication

### 4. Updated Admin Routes

**Files:** 
- `backend/routes/admin.js`
- `backend/routes/orders.js`

- Admin checks now prefer `req.user` with fallback to `req.session.user`
- Maintains backward compatibility with existing code

## Environment Variables

### Required in Production

- **`SESSION_SECRET`**: Secret key for signing session cookies
  - Must be a strong, random string
  - Should be different for each environment
  - Server will exit with error if missing in production

### Optional

- **`MONGO_URI`**: MongoDB connection string
  - When set, sessions are persisted to MongoDB (recommended for production)
  - When not set, sessions use in-memory store (development only)

- **`FIREBASE_SERVICE_ACCOUNT_JSON`**: Firebase service account credentials
  - Can be raw JSON string or base64-encoded JSON
  - If not provided, uses application default credentials
  - Example (base64): `echo '{"type":"service_account",...}' | base64`

## Testing

Run tests with:
```bash
npm test
```

All existing tests pass, plus new tests for:
- Firebase Admin initialization
- Auth middleware functionality
- Admin email checking

## Backward Compatibility

All changes are backward compatible:
- `req.session.user` continues to work
- Existing routes and middleware require no changes
- Session behavior is unchanged for existing users

## Security Improvements

1. **Session security**: Secure cookie settings prevent common attacks
2. **Centralized initialization**: Prevents misconfiguration and initialization race conditions
3. **Consistent auth state**: Both `req.user` and `req.session.user` are synchronized
4. **Production safeguards**: Server won't start in production without proper configuration

## Migration Guide

For existing deployments:

1. Add `SESSION_SECRET` environment variable (required in production)
2. Optionally add `FIREBASE_SERVICE_ACCOUNT_JSON` if not using application default credentials
3. Restart the backend server
4. Verify logs show "Session middleware configured" and "Firebase Admin initialized"

No code changes required in routes or other middleware.

