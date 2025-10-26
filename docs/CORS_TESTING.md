# CORS Testing Guide

This document provides curl commands to test CORS configuration for the Bonnie Lass Florals backend.

## Environment Variable

The backend uses the `CLIENT_ORIGINS` environment variable to configure allowed origins:
- **Default**: `https://bonnielassflorals.com`
- **Format**: Comma-separated list (e.g., `CLIENT_ORIGINS=https://bonnielassflorals.com,https://example.com`)

## Base URLs

Replace `<BACKEND_URL>` in the commands below with the appropriate environment URL:
- **Production**: `https://bonnie-lass-florals.onrender.com`
- **Local Development**: `http://localhost:5000`
- **Staging**: (your staging URL)

## Test Commands

### 1. Test Preflight Request (OPTIONS)

This simulates a browser's preflight request before making an actual API call:

```bash
curl -i -X OPTIONS \
  -H "Origin: https://bonnielassflorals.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, authorization" \
  "<BACKEND_URL>/api/admin/check"
```

**Expected Response Headers:**
- `Access-Control-Allow-Origin: https://bonnielassflorals.com`
- `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With`

### 2. Test Actual GET Request

```bash
curl -i -X GET \
  -H "Origin: https://bonnielassflorals.com" \
  -H "Content-Type: application/json" \
  "<BACKEND_URL>/api/admin/check"
```

**Expected Response Headers:**
- `Access-Control-Allow-Origin: https://bonnielassflorals.com`

### 3. Test Theme/Background Endpoint (GET)

```bash
curl -i -X GET \
  -H "Origin: https://bonnielassflorals.com" \
  "<BACKEND_URL>/api/settings/theme"
```

### 4. Test Theme/Background Endpoint (PUT with Authorization)

**Note**: Replace `<YOUR_TOKEN>` with a valid Firebase ID token. You can obtain this by logging in through the frontend and inspecting the Authorization header in the browser's developer tools network tab.

```bash
curl -i -X PUT \
  -H "Origin: https://bonnielassflorals.com" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"theme":"fall"}' \
  "<BACKEND_URL>/api/settings/theme"
```

### 5. Test Preflight for Theme Endpoint

```bash
curl -i -X OPTIONS \
  -H "Origin: https://bonnielassflorals.com" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: content-type, authorization" \
  "<BACKEND_URL>/api/settings/theme"
```

### 6. Test Request with No Origin (Server-to-Server)

This should be allowed per the CORS configuration:

```bash
curl -i -X GET \
  "<BACKEND_URL>/api/admin/check"
```

### 7. Test Blocked Origin

This should fail with a CORS error:

```bash
curl -i -X GET \
  -H "Origin: https://malicious-site.com" \
  "<BACKEND_URL>/api/admin/check"
```

**Expected**: No `Access-Control-Allow-Origin` header in response.

## Verification Checklist

When testing, verify that:
- ✅ Requests from `https://bonnielassflorals.com` receive proper CORS headers
- ✅ OPTIONS preflight requests return 200-204 status
- ✅ `Access-Control-Allow-Headers` includes Content-Type, Authorization, and X-Requested-With
- ✅ `Access-Control-Allow-Methods` includes GET, POST, PUT, PATCH, DELETE, OPTIONS
- ✅ Requests with no Origin header are allowed
- ✅ Requests from unlisted origins are blocked (no CORS headers)
- ✅ No `Access-Control-Allow-Credentials` header is present (credentials: false)

## Local Testing

For local testing, you can override the allowed origins:

```bash
CLIENT_ORIGINS=http://localhost:3000,https://bonnielassflorals.com npm start
```

Then test with:

```bash
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  "http://localhost:5000/api/admin/check"
```
