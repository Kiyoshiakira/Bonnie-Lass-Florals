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

## Firebase Storage Image Upload

### Overview
Product images are now uploaded directly to Firebase Storage from the admin UI, eliminating the need for server-side file uploads and preventing image loss on deployments. The backend stores Firebase Storage URLs in the database and serves them as-is to clients.

### How It Works

#### Client-Side Upload Flow (Primary)
1. Admin selects an image file in the upload form (`public/admin/upload.html`)
2. JavaScript uploads the file directly to Firebase Storage using the Firebase SDK
3. Firebase Storage returns a secure download URL (e.g., `https://firebasestorage.googleapis.com/...`)
4. The admin UI sends a JSON request to the backend with the Firebase Storage URL
5. Backend saves the URL in the product's `image` field
6. All clients receive the Firebase Storage URL when fetching products

#### Fallback: Multer Disk Upload (Legacy Support)
If a client sends a `multipart/form-data` request with an image file:
1. Backend uses multer to save the file to `/admin/uploads/`
2. Stores a relative path (e.g., `/admin/uploads/123-image.jpg`) in the database
3. `normalizeImageUrl()` converts this to an absolute URL when serving to clients

**Note:** New uploads should use Firebase Storage. Multer is maintained for backward compatibility with existing products that have local images.

### Admin Upload Instructions

#### Single Product Upload
1. Navigate to `/admin/upload.html`
2. Fill in product details
3. Either:
   - **Option A (Recommended):** Upload an image file using the "Or upload image file" field
     - File is uploaded to Firebase Storage automatically
     - Max size: 10MB
     - Allowed types: JPEG, PNG, GIF, WebP
   - **Option B:** Enter a publicly accessible image URL in the "Image URL" field
4. Click "Upload Product"
5. The form will show "Uploading image..." then "Saving product..." before completing

#### Edit Existing Product
1. Click "Edit" on any product in the Manage Products section
2. Either:
   - Upload a new image file (replaces the current image)
   - Update the Image URL field with a new URL
   - Leave both blank to keep the existing image
3. Click "Save Changes"

#### CSV Batch Upload
1. Prepare a CSV file with columns: `name`, `description`, `price`, `type`, `subcategory`, `stock`, `options`, `image`
2. In the `image` column:
   - **Recommended:** Provide publicly accessible image URLs (http:// or https://)
   - **Not recommended:** Local file paths (these will be treated as missing)
3. Upload the CSV using the "Batch Upload via CSV" section
4. The backend will save URL values as-is

**Important:** CSV upload does NOT support uploading image files. You must provide image URLs. To use Firebase Storage URLs in CSV:
1. Upload images manually using the single product upload form
2. Copy the Firebase Storage URLs from the database or product details
3. Use these URLs in your CSV file

### Security & Validation

#### Client-Side Validation (upload.html)
- **File type check:** Only allows JPEG, PNG, GIF, and WebP
- **File size limit:** Maximum 10MB per image
- **Filename sanitization:** Removes special characters and path traversal sequences
- **User authentication:** Requires Firebase authentication before upload

#### Firebase Storage Rules
Firebase Storage security rules (see `storage.rules`) enforce:
- Authenticated writes only
- Maximum file size: 10MB
- Allowed content types: image/jpeg, image/png, image/gif, image/webp
- Path structure: `product-images/{timestamp}-{filename}`

#### Backend Handling
- Accepts both Firebase Storage URLs and legacy relative paths
- `normalizeImageUrl()` validates and normalizes all image URLs
- Returns absolute URLs to all clients for consistent rendering

### Migration Strategy

#### Existing Products
Products with relative image paths (e.g., `/admin/uploads/image.jpg`) continue to work:
1. The `normalizeImageUrl()` function converts them to absolute URLs
2. If `BACKEND_URL` is set, prepends it: `https://bonnie-lass-florals.onrender.com/admin/uploads/image.jpg`
3. If not set, returns the relative path (works for same-origin deployments)

#### Gradual Migration
You can optionally migrate existing images to Firebase Storage:
1. Download images from `/admin/uploads/` directory
2. Re-upload them using the admin UI (will upload to Firebase Storage)
3. Delete local files after verifying the new URLs work

**Note:** Migration is optional. The system supports both storage methods indefinitely.

### Troubleshooting

#### "Failed to upload image to storage" Error
- **Cause:** User is not authenticated with Firebase
- **Solution:** Sign in to Firebase using the admin login

#### "Invalid file type" Error
- **Cause:** File is not JPEG, PNG, GIF, or WebP
- **Solution:** Convert the image to a supported format

#### "File size exceeds 10MB limit" Error
- **Cause:** Image file is too large
- **Solution:** Compress or resize the image before uploading

#### Images Don't Display on Frontend
1. **Check the image URL in the database:** Should start with `https://firebasestorage.googleapis.com/` for new uploads
2. **Check Firebase Storage rules:** Ensure public read access is enabled
3. **Check browser console:** Look for CORS or authentication errors
4. **Verify BACKEND_URL:** For legacy images, ensure this environment variable is set correctly

### Technical Details

#### Image URL Normalization (backend/utils/media.js)
```javascript
function normalizeImageUrl(image) {
  if (!image) return '';
  
  // Firebase Storage URLs and other absolute URLs: return as-is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  
  // Legacy relative paths: convert to absolute URL if BACKEND_URL is set
  if (!BACKEND_URL) {
    return image.startsWith('/') ? image : '/' + image;
  }
  
  return BACKEND_URL + (image.startsWith('/') ? image : '/' + image);
}
```

#### Upload Function (public/admin/upload.html)
```javascript
async function uploadImageToFirebase(file) {
  // Validate file type and size
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  // Upload to Firebase Storage
  const storage = firebase.storage();
  const storageRef = storage.ref();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `product-images/${timestamp}-${safeName}`;
  const imageRef = storageRef.child(filename);
  
  const snapshot = await imageRef.put(file, {
    contentType: file.type,
    customMetadata: { uploadedAt: new Date().toISOString() }
  });
  
  return await snapshot.ref.getDownloadURL();
}
```

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

### 9. Test Firebase Storage Upload

**Prerequisites:**
- Valid admin Firebase credentials
- Access to `https://bonnie-lass-florals.web.app/admin/upload.html`

#### Test Single Product Upload with Firebase Storage

1. Sign in to Firebase on the admin upload page
2. Fill in product details:
   - Name: "Test Firebase Storage Product"
   - Description: "Testing direct Firebase upload"
   - Price: 25.99
   - Type: "decor"
   - Stock: 5
3. Select an image file (< 10MB, JPEG/PNG/GIF/WebP)
4. Click "Upload Product"
5. Verify:
   - [ ] Button text changes to "Uploading image..."
   - [ ] Button text changes to "Saving product..."
   - [ ] Success message appears
   - [ ] Form resets

#### Verify Firebase Storage URL in Database

```bash
curl https://bonnie-lass-florals.onrender.com/api/products | jq '.products[] | select(.name == "Test Firebase Storage Product") | .image'
```

Expected output:
```
"https://firebasestorage.googleapis.com/v0/b/bonnie-lass-florals.firebasestorage.app/o/product-images%2F..."
```

#### Test Edit Product with New Firebase Image

1. Click "Load All Products" in Manage Products section
2. Click "Edit" on the test product
3. Upload a different image file
4. Click "Save Changes"
5. Verify:
   - [ ] Button shows "Uploading image..." then "Saving changes..."
   - [ ] Modal closes after success
   - [ ] Product list updates with new image
   - [ ] New image displays correctly

#### Test CSV Batch Upload with Image URLs

1. Create a CSV file `test-products.csv`:
   ```csv
   name,description,price,type,image
   "CSV Product 1","First test",15.99,decor,https://firebasestorage.googleapis.com/v0/b/bonnie-lass-florals.firebasestorage.app/o/sample1.jpg
   "CSV Product 2","Second test",20.00,food,https://example.com/image2.jpg
   ```
2. Upload the CSV using "Batch Upload via CSV"
3. Verify:
   - [ ] Both products are created successfully
   - [ ] Image URLs are saved exactly as provided in CSV
   - [ ] No upload to Firebase Storage occurs (CSV uses URLs as-is)

#### Test Image URL Validation

1. Try to upload a product with image URL field set to `https://example.com/image.jpg`
2. Verify:
   - [ ] Product is created
   - [ ] No file upload occurs
   - [ ] URL is saved as-is in the database
   - [ ] Image displays on frontend (if URL is valid)

#### Test Fallback Behavior (Legacy Support)

**Note:** This requires using multipart/form-data instead of JSON, which is the fallback mode.

To test multer fallback, you would need to:
1. Modify the frontend temporarily to use FormData
2. Upload a product
3. Verify file is saved to `/admin/uploads/` directory
4. Verify relative path is saved in database

**In production:** This fallback is maintained for compatibility but new uploads should use Firebase Storage.

#### Test Error Handling

1. **Test file size limit:**
   - Try to upload an image > 10MB
   - Expected: "File size exceeds 10MB limit" error

2. **Test invalid file type:**
   - Try to upload a PDF or TXT file
   - Expected: "Invalid file type" error

3. **Test unauthenticated upload:**
   - Sign out of Firebase
   - Try to upload a product with image
   - Expected: Firebase authentication error

## Future Improvements

- [ ] Add Redis for distributed rate limiting (multi-instance deployments)
- [ ] Implement request logging middleware
- [x] ~~Migrate to Firebase Storage for all images~~ (COMPLETED - new uploads use Firebase Storage, legacy local images still supported)
- [ ] Optionally migrate existing local images to Firebase Storage
- [ ] Add API response caching
- [ ] Implement automated integration tests
- [ ] Add monitoring/alerting for rate limit violations
- [ ] Add server-side Firebase Admin cleanup for orphaned images

---

## Request Validation & Image Normalization (Latest Updates)

### New Features Added

#### 1. Express-Validator Integration
All product endpoints now validate input using `express-validator` middleware:

**POST /api/products validation:**
- `name` - Required, max 200 characters
- `description` - Optional, max 2000 characters
- `price` - Required, numeric, >= 0
- `type` - Optional, must be "decor" or "food"
- `stock` - Optional, integer >= 0
- `options` - Optional, string or array

**PUT /api/products/:id validation:**
- Same as POST but all fields are optional
- Only validates fields that are provided

**POST /api/products/batch validation:**
- `products` - Required, must be array
- Array length: 1-100 items
- Each product must have `name` and numeric `price`

Invalid requests return 400 with detailed error messages:
```json
{
  "errors": [
    {
      "msg": "Name must be 200 characters or less",
      "param": "name",
      "location": "body"
    }
  ]
}
```

#### 2. Product Model Virtual - imageUrl
- Added `imageUrl` virtual to Product schema
- Automatically computes canonical image URL using `normalizeImageUrl()`
- Virtuals included in JSON/Object serialization
- Provides consistent image URL format across all API responses

#### 3. Enhanced Frontend Security
- Added `escapeAttr()` helper for safe HTML attribute values
- Changed default product image from `default-avatar.png` to `default-product.png`
- All product attributes properly escaped before rendering

#### 4. Logger Usage Standardization
- Replaced all `console.error()` calls with `logger.error()` in:
  - `backend/routes/settings.js`
  - `backend/routes/products.js` (already done in previous PR)
- Consistent structured logging across backend

### Manual Testing Instructions

#### Test 1: POST /api/products Validation

**Test invalid name (too long):**
```bash
curl -X POST https://bonnie-lass-florals.onrender.com/api/products \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'"$(printf 'A%.0s' {1..250})"'",
    "price": 25.99
  }'
```

Expected: `400 Bad Request` with error message about name length

**Test invalid price (negative):**
```bash
curl -X POST https://bonnie-lass-florals.onrender.com/api/products \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": -10
  }'
```

Expected: `400 Bad Request` with error about price >= 0

**Test invalid type:**
```bash
curl -X POST https://bonnie-lass-florals.onrender.com/api/products \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "price": 25.99,
    "type": "invalid_type"
  }'
```

Expected: `400 Bad Request` with error about type must be "decor" or "food"

**Test missing required fields:**
```bash
curl -X POST https://bonnie-lass-florals.onrender.com/api/products \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Missing name and price"
  }'
```

Expected: `400 Bad Request` with errors for missing name and price

**Test valid product creation:**
```bash
curl -X POST https://bonnie-lass-florals.onrender.com/api/products \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beautiful Floral Arrangement",
    "description": "A lovely arrangement perfect for any occasion",
    "price": 45.99,
    "type": "decor",
    "stock": 10
  }'
```

Expected: `201 Created` with product object including `imageUrl` virtual

#### Test 2: PUT /api/products/:id Validation

**Test invalid update (description too long):**
```bash
curl -X PUT https://bonnie-lass-florals.onrender.com/api/products/<PRODUCT_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "'"$(printf 'A%.0s' {1..2100})"'"
  }'
```

Expected: `400 Bad Request` with error about description max length

**Test valid partial update:**
```bash
curl -X PUT https://bonnie-lass-florals.onrender.com/api/products/<PRODUCT_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 39.99,
    "stock": 5
  }'
```

Expected: `200 OK` with updated product including `imageUrl` virtual

#### Test 3: POST /api/products/batch Validation

**Test empty products array:**
```bash
curl -X POST https://bonnie-lass-florals.onrender.com/api/products/batch \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"products": []}'
```

Expected: `400 Bad Request` with error "Products array cannot be empty"

**Test too many products (>100):**
```bash
# Generate 101 products
curl -X POST https://bonnie-lass-florals.onrender.com/api/products/batch \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"products\": $(node -e 'console.log(JSON.stringify(Array(101).fill({name:"Test",price:10})))')}"
```

Expected: `400 Bad Request` with error "Batch size limited to 100 products"

**Test missing required fields in batch:**
```bash
curl -X POST https://bonnie-lass-florals.onrender.com/api/products/batch \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {"name": "Product 1", "price": 10},
      {"name": "Product 2"},
      {"price": 15}
    ]
  }'
```

Expected: `400 Bad Request` with errors identifying products missing required fields

**Test valid batch upload:**
```bash
curl -X POST https://bonnie-lass-florals.onrender.com/api/products/batch \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {"name": "Batch Product 1", "price": 20, "type": "decor"},
      {"name": "Batch Product 2", "price": 30, "type": "food", "stock": 5}
    ]
  }'
```

Expected: `201 Created` with success/error/skipped results

#### Test 4: Product imageUrl Virtual

**Verify virtual in API response:**
```bash
curl https://bonnie-lass-florals.onrender.com/api/products | jq '.[0] | {image, imageUrl}'
```

Expected output shows both `image` (DB value) and `imageUrl` (computed virtual):
```json
{
  "image": "/admin/uploads/product.jpg",
  "imageUrl": "https://bonnie-lass-florals.onrender.com/admin/uploads/product.jpg"
}
```

Or for absolute URLs:
```json
{
  "image": "https://firebasestorage.googleapis.com/...",
  "imageUrl": "https://firebasestorage.googleapis.com/..."
}
```

#### Test 5: Frontend Default Product Image

1. Navigate to `https://bonnie-lass-florals.web.app/shop.html`
2. Create a product with empty image via admin panel
3. Verify the product displays with `/img/default-product.png` placeholder
4. Inspect element to confirm:
   - Image has `loading="lazy"` attribute
   - Image has `width="300" height="300"` attributes
   - No broken image icon displayed

#### Test 6: Attribute Escaping

1. Create a product with special characters in the name:
   ```json
   {
     "name": "Test <script>alert('xss')</script> Product",
     "price": 10
   }
   ```
2. View on shop.html
3. Verify:
   - Name displays as text (no script execution)
   - HTML is properly escaped in display
   - Attributes are safely escaped

### Validator Error Response Format

When validation fails, the API returns a 400 status with this structure:

```json
{
  "errors": [
    {
      "value": "<invalid_value>",
      "msg": "<human_readable_error_message>",
      "param": "<field_name>",
      "location": "body"
    }
  ]
}
```

Multiple validation errors are returned together in the `errors` array.

### Rollback Instructions

If validation causes issues:

**Temporarily disable validation on specific endpoint:**

In `backend/routes/products.js`, remove the validation middleware array:
```javascript
// Before:
router.post('/', firebaseAdminAuth, adminMutationLimiter, createProductValidation, upload.single('image'), async (req, res) => {

// After:
router.post('/', firebaseAdminAuth, adminMutationLimiter, upload.single('image'), async (req, res) => {
```

**Revert to previous version:**
```bash
git checkout HEAD~1 -- backend/routes/products.js backend/models/Product.js
```
