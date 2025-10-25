# Firebase Storage Integration Guide

## Overview

Product images are now stored in Firebase Storage instead of the ephemeral Render filesystem. This provides:
- **Durability**: Images persist across deployments and server restarts
- **CDN Performance**: Firebase CDN serves images globally with low latency
- **Scalability**: No storage limits on the web server

## How It Works

### Client-Side Upload Flow

1. **Admin uploads a product** via `/admin/upload.html`
2. **Image file selected** via file input
3. **Client uploads to Firebase Storage** using `uploadImageToFirebase()` function
4. **Firebase returns a public URL** (e.g., `https://firebasestorage.googleapis.com/...`)
5. **Product data submitted to backend** with the Firebase Storage URL
6. **Backend stores the URL** in MongoDB (no file handling required)

### Key Components

#### Firebase Storage Helper Function
Located in `/public/admin/upload.html`:

```javascript
async function uploadImageToFirebase(file) {
  const storage = firebase.storage();
  const storageRef = storage.ref();
  const timestamp = Date.now();
  const safeName = file.name.replace(/\s+/g, '_');
  const filename = `product-images/${timestamp}-${safeName}`;
  const imageRef = storageRef.child(filename);
  const snapshot = await imageRef.put(file);
  const downloadURL = await snapshot.ref.getDownloadURL();
  return downloadURL;
}
```

#### Single Product Upload
- Upload form modified to upload image to Firebase first
- Product data sent as JSON (not multipart) with image URL
- Backend accepts both multipart (legacy) and JSON with URL

#### Edit Product
- Edit modal supports uploading new images to Firebase
- Updates product with new Firebase Storage URL

#### Batch CSV Upload
- CSV format expects image URLs in the `image` column
- Admin should pre-upload images to Firebase Storage or use existing URLs
- Backend `/api/products/batch` endpoint accepts array of product objects

### Firebase SDK Integration

All pages that display product images include the Firebase Storage SDK:

```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-storage-compat.js"></script>
```

Pages with SDK:
- `/index.html`
- `/shop.html`
- `/cart.html`
- `/checkout.html`
- `/orders.html`
- `/profile.html`
- `/gallery.html`
- `/admin/upload.html`
- `/admin/orders.html`
- `/admin/palette.html`

## Backend Changes

### New Batch Upload Endpoint

`POST /api/products/batch` - Admin only
- Accepts JSON array of up to 100 products
- Each product should include Firebase Storage URL in `image` field
- Returns detailed results with success/error counts

Example request:
```json
{
  "products": [
    {
      "name": "Product 1",
      "description": "Description",
      "price": 29.99,
      "type": "decor",
      "image": "https://firebasestorage.googleapis.com/...",
      "stock": 10
    }
  ]
}
```

### Updated Single Product Endpoints

`POST /api/products` - Now accepts both:
- Multipart form data (legacy, still supported)
- JSON with image URL (new, preferred)

`PUT /api/products/:id` - Same dual support

## Firebase Storage Structure

Images are stored in Firebase Storage with this path structure:
```
product-images/
  ├── 1234567890-flower_arrangement.jpg
  ├── 1234567891-wreath.png
  └── ...
```

Each filename includes:
- Timestamp (milliseconds since epoch)
- Original filename (spaces replaced with underscores)

## Migration Notes

### Existing Products
- Products with old Render filesystem paths (`/admin/uploads/...`) will continue to work
- Backend normalizes paths to absolute URLs
- Gradually migrate by re-uploading images via admin panel

### CSV Uploads
- Pre-upload images to Firebase Storage or use existing URLs
- Include Firebase Storage URLs in CSV `image` column
- No file upload support in CSV batch - URLs only

## Security

- Firebase Storage rules should restrict write access to authenticated admins
- Public read access for product images
- Authentication via Firebase Admin SDK on backend
- Rate limiting recommended for batch uploads (see CodeQL alert)

## Testing

1. **Single Upload**: Upload a product with an image file
2. **Edit Product**: Edit existing product and upload new image
3. **Batch Upload**: Upload CSV with Firebase Storage URLs
4. **Image Display**: Verify images load on shop, cart, checkout pages
5. **Image Zoom**: Click product images to verify zoom modal works
