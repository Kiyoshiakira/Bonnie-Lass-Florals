# Multi-Image and Etsy Import Feature

## Overview
This feature adds support for multiple images per product and Etsy CSV import with automatic extraction of all product images (IMAGE1 through IMAGE10).

## Changes Made

### Backend Changes

1. **Product Model** (`backend/models/Product.js`)
   - Added `images` array field to store multiple image URLs
   - Added `imageUrls` virtual field for backward compatibility
   - Maintained `image` field for primary image (backward compatible)

2. **Product Routes** (`backend/routes/products.js`)
   - Updated POST `/api/products` to accept `images` array
   - Updated PUT `/api/products/:id` to support updating multiple images
   - Enhanced batch upload to extract IMAGE1-IMAGE10 from Etsy CSV
   - Automatically sets first image as primary image

3. **Media Utilities** (`backend/utils/media.js`)
   - Updated `normalizeProduct()` to handle images array
   - Ensures all image URLs are normalized to absolute URLs
   - Creates images array from single image for backward compatibility

### Frontend Changes

1. **Admin Upload Page** (`public/admin/upload.html`)
   - Added support for uploading multiple image files
   - Added textarea for entering multiple image URLs
   - Updated CSV upload to extract all Etsy images (IMAGE1-IMAGE10)
   - Enhanced edit modal to display and manage all product images
   - Shows image count badge on product cards in panel view
   - Progress indicators during multi-file uploads

2. **Shop Page** (`public/shop.js`)
   - Added image carousel for products with multiple images
   - Carousel includes prev/next buttons and dot indicators
   - Automatically hides carousel controls for single-image products
   - Maintains full backward compatibility with single-image products

## Usage

### Uploading Products with Multiple Images

#### Single Product Upload
1. Go to Admin → Upload Product
2. Fill in product details
3. Choose one of these options:
   - Upload multiple image files using "Upload multiple image files" input
   - Enter multiple image URLs (one per line or comma-separated) in "Additional Image URLs"
   - Upload primary image file + add additional URLs
4. Click "Upload Product"

#### CSV Batch Upload (Etsy Import)
1. Export your Etsy listings as CSV (includes IMAGE1-IMAGE10 columns)
2. Go to Admin → Upload Product
3. Click "Choose File" under "Batch Upload via CSV"
4. Select your Etsy CSV file
5. Click "Upload CSV"
6. All images (IMAGE1 through IMAGE10) will be automatically imported for each product

### Editing Products with Multiple Images
1. Go to Admin → Upload Product → Load All Products
2. Click "Edit" on any product
3. View all current images in the preview section
4. Modify image URLs in the textarea (one per line)
5. Or upload new image files using the multi-file input
6. Click "Save Changes"

### Customer Experience
- Products with multiple images show a carousel with navigation arrows
- Dot indicators show the current image position
- Single-image products display normally without carousel controls
- Carousel is fully responsive and touch-friendly

## API Changes

### POST /api/products
**New Field:**
```json
{
  "images": ["url1", "url2", "url3"]
}
```
The first image in the array becomes the primary `image` field.

### PUT /api/products/:id
**New Field:**
```json
{
  "images": ["url1", "url2", "url3"]
}
```
Updates the entire images array.

### Batch Upload POST /api/products/batch
**Enhanced CSV Processing:**
- Automatically extracts IMAGE1 through IMAGE10 from CSV
- Creates `images` array with all non-empty image URLs
- Sets first image as primary

## Database Schema

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  image: String,           // Primary image (backward compatible)
  images: [String],        // Array of all images (new)
  // ... other fields
}
```

### Virtual Fields
- `imageUrl`: Normalized primary image URL
- `imageUrls`: Array of normalized image URLs

## Backward Compatibility

The implementation maintains full backward compatibility:
- Existing products with single `image` field continue to work
- Products without `images` array automatically get one created from `image`
- Shop page works with both single and multi-image products
- API accepts both old format (single `image`) and new format (`images` array)

## Testing

Run tests with:
```bash
npm test
```

All tests pass (39/39), including new tests for multi-image functionality.

## Security

CodeQL security scan shows 0 vulnerabilities.

## Sample Etsy CSV Format

```csv
TITLE,DESCRIPTION,PRICE,CURRENCY_CODE,QUANTITY,TAGS,MATERIALS,IMAGE1,IMAGE2,IMAGE3,...
"Product Name","Description",29.99,USD,5,"tag1,tag2","material",url1,url2,url3,...
```

The system automatically extracts all IMAGE1-IMAGE10 columns and creates a multi-image product.
