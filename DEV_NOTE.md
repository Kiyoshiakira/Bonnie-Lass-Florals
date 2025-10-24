# Development Notes - Security & Performance Improvements

## Overview
This document describes the security, logging, and performance improvements made to the Bonnie Lass Florals application.

## New Environment Variables

### Optional Configuration
- `BACKEND_URL` - Base URL for the backend server (e.g., `https://bonnie-lass-florals.onrender.com`)
  - Used for normalizing image URLs to absolute paths
  - If not set, relative paths will be used (suitable for same-origin deployments)
- `FRONTEND_ORIGINS` - Comma-separated list of allowed CORS origins
  - Defaults to: `https://bonnielassflorals.com,https://bonnie-lass-florals.onrender.com,https://bonnie-lass-florals.web.app,https://bonnie-lass-florals.firebaseapp.com`
- `NODE_ENV` - Set to `development` for detailed error messages, `production` for minimal error responses

## New Features

### Backend Security & Reliability

#### 1. Security Headers (Helmet)
- Automatically sets common security headers to protect against common web vulnerabilities
- Includes protections for XSS, clickjacking, MIME sniffing, etc.

#### 2. Rate Limiting
**Global API Rate Limit:**
- 60 requests per minute per IP address
- Applies to all `/api/*` routes

**Admin Mutation Rate Limit:**
- 10 requests per minute per IP address
- Applies to:
  - `POST /api/products`
  - `POST /api/products/batch`
  - `PUT /api/products/:id`
  - `DELETE /api/products/:id`

**Rate Limit Response:**
When exceeded, the API returns:
```json
{
  "error": "Too many requests, please try again later."
}
```
HTTP Status: `429 Too Many Requests`

#### 3. Structured Logging
- New `backend/utils/logger.js` utility provides consistent logging
- Methods: `logger.info()`, `logger.warn()`, `logger.error()`
- Logs include severity prefix: `[INFO]`, `[WARN]`, `[ERROR]`
- Easy to upgrade to more advanced logging libraries (pino, winston) later

#### 4. Centralized Error Handling
- Catches unhandled errors in async routes
- Returns consistent JSON error responses
- In development: includes error stack traces
- In production: sanitizes error messages to prevent information leakage

#### 5. Centralized Image URL Normalization
- New `backend/utils/media.js` utility
- Functions:
  - `normalizeImageUrl(image)` - Converts relative paths to absolute URLs
  - `normalizeProduct(product)` - Normalizes product object's image URL
- Priority order:
  1. Absolute URLs (http://, https://) - returned as-is
  2. Storage provider URLs from database
  3. BACKEND_URL fallback (if set)
  4. Relative paths (if BACKEND_URL not set)

### Frontend Performance & Security

#### 1. Lazy Loading Images
- All product images now use `loading="lazy"` attribute
- Images have width/height attributes (300x300) to reduce layout shift
- Improves initial page load performance

#### 2. Event Delegation for Add to Cart
- Removed inline `onclick` attributes with JSON stringification
- Implemented event delegation pattern
- Benefits:
  - More secure (no inline scripts)
  - Better performance (fewer event listeners)
  - Easier to maintain and test

#### 3. HTML Sanitization
- New `escapeHtml()` helper function prevents XSS attacks
- Sanitizes all user-generated content before rendering:
  - Product names
  - Product descriptions
  - Product options
  - Product IDs

#### 4. Default Product Image Placeholder
- Products with missing/empty images show `/img/default-avatar.png`
- Prevents broken image icons in the UI

## Manual Testing Guide

### 1. Verify Server Starts

```bash
npm start
```

Expected output:
```
[INFO] Serving static uploads from: /path/to/backend/public/admin/uploads
[INFO] MongoDB connected
[INFO] Loading router: /api/auth
[INFO] Loading router: /api/contact
[INFO] Loading router: /api/products
[INFO] Loading router: /api/orders
[INFO] Loading router: /api/messages
[INFO] Loading router: /api/payments
[INFO] Loading router: /api/settings
[INFO] Loading router: /api/admin
[INFO] Server running on port 5000
```

### 2. Test Security Headers

```bash
curl -I https://bonnie-lass-florals.onrender.com/api/products
```

Expected headers (set by Helmet):
```
X-DNS-Prefetch-Control: off
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Download-Options: noopen
X-Content-Type-Options: nosniff
X-Permitted-Cross-Domain-Policies: none
Referrer-Policy: no-referrer
X-XSS-Protection: 0
```

### 3. Test Global Rate Limiting

Run this script to exceed the 60 requests/minute limit:

```bash
# Send 65 requests rapidly
for i in {1..65}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://bonnie-lass-florals.onrender.com/api/products
done
```

Expected:
- First 60 requests: `200 OK`
- Remaining 5 requests: `429 Too Many Requests`

Check the response body for requests 61-65:
```bash
curl https://bonnie-lass-florals.onrender.com/api/products
```

Expected response:
```json
{
  "error": "Too many requests, please try again later."
}
```

### 4. Test Admin Rate Limiting

**Prerequisites:**
- Valid admin Firebase token
- Set token in `Authorization: Bearer <token>` header

```bash
# Replace <YOUR_ADMIN_TOKEN> with actual token
TOKEN="<YOUR_ADMIN_TOKEN>"

# Send 15 batch upload requests rapidly
for i in {1..15}; do
  curl -X POST https://bonnie-lass-florals.onrender.com/api/products/batch \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"products": [{"name": "Test Product '$i'", "price": 10}]}' \
    -s -o /dev/null -w "%{http_code}\n"
done
```

Expected:
- First 10 requests: `201 Created` or `400 Bad Request` (depending on data)
- Remaining 5 requests: `429 Too Many Requests`

### 5. Test Frontend Product Rendering

1. Open `https://bonnie-lass-florals.web.app/shop.html` in a browser
2. Open DevTools Console (F12)
3. Verify:
   - [ ] Product cards render correctly
   - [ ] Images have `loading="lazy"` attribute (inspect in Elements tab)
   - [ ] Images have `width="300" height="300"` attributes
   - [ ] No inline `onclick` attributes on "Add to Cart" buttons
   - [ ] Buttons have `class="add-to-cart"` and `data-id="<product_id>"`

### 6. Test Add to Cart Functionality

1. Click "Add to Cart" on any product
2. Verify:
   - [ ] Product is added to cart (cart count increases)
   - [ ] Success notification appears (if implemented)
   - [ ] No console errors
   - [ ] Event delegation works (handled by container click listener)

### 7. Test Default Placeholder Image

1. Create a product with empty image URL via admin panel:
   ```json
   {
     "name": "No Image Product",
     "price": 15.99,
     "image": ""
   }
   ```
2. View the product on shop.html
3. Verify:
   - [ ] Default avatar image displays instead of broken image
   - [ ] Image src is `/img/default-avatar.png`

### 8. Test Image URL Normalization

**Test Case 1: Absolute URL**
```bash
curl https://bonnie-lass-florals.onrender.com/api/products | jq '.[0].image'
```
If product has Firebase Storage URL, it should be returned as-is:
```
"https://firebasestorage.googleapis.com/..."
```

**Test Case 2: Relative URL**
If product has relative path (e.g., `/admin/uploads/image.jpg`):
- With BACKEND_URL set: `"https://bonnie-lass-florals.onrender.com/admin/uploads/image.jpg"`
- Without BACKEND_URL: `"/admin/uploads/image.jpg"`

## Rollback Instructions

If issues arise, you can temporarily disable features:

### Disable Rate Limiting
In `backend/index.js`, comment out:
```javascript
// app.use('/api/', globalLimiter);
```

### Disable Helmet
In `backend/index.js`, comment out:
```javascript
// app.use(helmet());
```

### Revert Frontend Changes
Replace `public/shop.js` with the previous version from git:
```bash
git checkout HEAD~1 -- public/shop.js
```

## Future Improvements

- [ ] Add Redis for distributed rate limiting (multi-instance deployments)
- [ ] Implement request logging middleware
- [ ] Add pagination for large product lists
- [ ] Migrate to Firebase Storage for all images
- [ ] Add API response caching
- [ ] Implement automated integration tests
- [ ] Add monitoring/alerting for rate limit violations
