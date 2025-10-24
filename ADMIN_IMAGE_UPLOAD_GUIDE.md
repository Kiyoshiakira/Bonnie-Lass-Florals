# Admin Guide: Image Upload & Optimization

## Quick Start

This guide helps you upload optimized images for the best website performance.

## Before You Upload

### 1. Optimize Your Images

**Use one of these free tools:**
- **[Squoosh](https://squoosh.app/)** - Best for WebP conversion and resizing
- **[TinyPNG](https://tinypng.com/)** - Easy drag-and-drop compression
- **[ImageOptim](https://imageoptim.com/)** - Mac app for batch optimization

### 2. Recommended Image Specifications

| Image Type | Dimensions | Format | Max File Size |
|------------|-----------|--------|---------------|
| Product Images | 800x800px to 1200x1200px | WebP or JPEG | 500KB (ideal) |
| Background Images | 1920x1080px | WebP or JPEG | 800KB (ideal) |
| Logo/Icons | Original size | PNG or WebP | 100KB |

### 3. Format Guide

**WebP (Recommended)** ✅
- Best compression (25-35% smaller than JPEG)
- Supported by all modern browsers
- Use for all new uploads when possible

**JPEG** ⭐
- Good for photos
- Use 80-85% quality setting
- Fallback when WebP not available

**PNG** 📄
- Use only for graphics needing transparency
- Larger file sizes than WebP/JPEG
- Good for logos and icons

## Uploading Product Images

### Option 1: Single Product Upload

1. Go to **Upload Product** page (`/admin/upload.html`)
2. Fill in product details
3. **Choose image file:**
   - Click "Or upload image file"
   - Select your optimized image
   - Image uploads to Firebase Storage automatically
4. Click **Upload Product**
5. Image URL is saved with the product

### Option 2: Batch CSV Upload

1. **First, upload all images individually:**
   - Use single product upload to upload each image
   - Copy the Firebase Storage URL for each image
   
2. **Create your CSV file:**
   ```csv
   name,description,price,type,image,stock
   "Pink Roses","Beautiful arrangement",29.99,decor,"https://firebasestorage.googleapis.com/v0/b/bonnie-lass-florals.firebasestorage.app/o/product-images%2F1234567890-roses.webp?alt=media&token=abc123",10
   ```

3. **Upload CSV:**
   - Go to Upload Product page
   - Use "Batch Upload via CSV" section
   - Select your CSV file
   - Click "Upload CSV"

## Image Optimization Workflow

### Step-by-Step Process

#### For Product Photos:

1. **Take or select your photo**
   - Use good lighting
   - Plain background works best
   - Center the product

2. **Resize the image**
   - Open in [Squoosh](https://squoosh.app/)
   - Resize to 1000x1000px (or 1200x1200px for detail)
   - Maintain square aspect ratio

3. **Convert to WebP**
   - In Squoosh, select "WebP" as output format
   - Set quality to 80-85%
   - Check file size (aim for < 500KB)

4. **Download and upload**
   - Download the optimized image
   - Upload via admin panel
   - Image is automatically stored in Firebase Storage

#### For Background Images:

1. **Prepare image**
   - Resize to 1920x1080px (Full HD)
   - Or 1280x720px for smaller file size

2. **Optimize**
   - Use Squoosh or TinyPNG
   - Convert to WebP (quality: 75-80%)
   - Aim for < 800KB file size

3. **Upload**
   - Go to Palette Editor (`/admin/palette.html`)
   - Use background image upload feature
   - Image stored in Firebase Storage `/backgrounds/`

## Image Naming Best Practices

**Good Examples:**
- `red-rose-bouquet.webp`
- `christmas-wreath-pine.jpg`
- `autumn-centerpiece-orange.webp`

**Bad Examples:**
- `IMG_1234.jpg`
- `photo.png`
- `untitled.webp`

**Tips:**
- Use lowercase letters
- Separate words with hyphens (-)
- Include descriptive keywords
- Avoid special characters
- Keep it concise (< 50 characters)

## Checking Image Performance

### After Upload:

1. **View on shop page**
   - Check image loads quickly
   - Verify quality is acceptable
   - Test on mobile device

2. **Use Browser DevTools**
   - Right-click image → Inspect
   - Check Network tab for file size
   - Aim for < 500KB per product image

3. **Run Lighthouse**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run Performance audit
   - Check image recommendations

## Troubleshooting

### Image Upload Fails

**Error: "File size exceeds 10MB limit"**
- Solution: Compress image using TinyPNG or Squoosh
- Resize to recommended dimensions
- Convert to WebP format

**Error: "Invalid file type"**
- Solution: Only upload image files
- Accepted: JPEG, PNG, GIF, WebP, SVG
- Check file extension is correct

**Error: "Permission denied"**
- Solution: Ensure you're logged in as admin
- Check Firebase Storage rules are configured
- Contact site administrator

### Image Looks Blurry

- Upload higher resolution (1200x1200px instead of 800x800px)
- Increase WebP quality to 85-90%
- Ensure original image is sharp

### Image Takes Too Long to Load

- Reduce file size (compress more)
- Resize to smaller dimensions
- Convert to WebP format
- Check file size < 500KB

## Advanced Tips

### Batch Optimization

If you have many images to optimize:

1. **Mac Users:**
   - Use ImageOptim app
   - Drag entire folder of images
   - Automatically optimizes all

2. **Windows/Mac/Linux:**
   - Use [Squoosh CLI](https://github.com/GoogleChromeLabs/squoosh/tree/dev/cli)
   - Batch process entire directories
   - Consistent settings for all images

### Creating Multiple Sizes

For future implementation of responsive images:

1. Create 3 sizes of each image:
   - Small: 400x400px (for mobile)
   - Medium: 800x800px (for tablet)
   - Large: 1200x1200px (for desktop)

2. Name consistently:
   - `product-400w.webp`
   - `product-800w.webp`
   - `product-1200w.webp`

3. Upload all sizes
4. Use srcset in HTML (future enhancement)

## Image Organization

### Firebase Storage Structure

```
/product-images/
  ├── 1699564800000-red-roses.webp
  ├── 1699564801000-pink-tulips.webp
  └── 1699564802000-white-lilies.webp

/backgrounds/
  ├── 1699564900000-spring-flowers.webp
  └── 1699564901000-autumn-leaves.webp
```

**Note:**
- Timestamps prevent filename conflicts
- Original filename preserved after timestamp
- Easy to identify images by name

## Resources

### Tools
- **[Squoosh](https://squoosh.app/)** - Image optimization and WebP conversion
- **[TinyPNG](https://tinypng.com/)** - PNG and JPEG compression
- **[ImageOptim](https://imageoptim.com/)** - Mac batch optimization
- **[GIMP](https://www.gimp.org/)** - Free image editor
- **[Paint.NET](https://www.getpaint.net/)** - Windows image editor

### Learning Resources
- [WebP vs JPEG comparison](https://developers.google.com/speed/webp/docs/webp_study)
- [Image optimization guide by Google](https://web.dev/fast/#optimize-your-images)
- [Firebase Storage documentation](https://firebase.google.com/docs/storage)

### Related Documentation
- `IMAGE_OPTIMIZATION_GUIDE.md` - Technical implementation details
- `FIREBASE_STORAGE_RULES.md` - Storage security rules
- `FIREBASE_STORAGE_GUIDE.md` - Firebase Storage integration

## Checklist

Before uploading any image:

- [ ] Image is optimized/compressed
- [ ] Dimensions are appropriate (800x800 to 1200x1200 for products)
- [ ] File size is under 500KB (products) or 800KB (backgrounds)
- [ ] Format is WebP (preferred) or JPEG
- [ ] Filename is descriptive and properly formatted
- [ ] Image quality is verified (not blurry or pixelated)
- [ ] You're logged in as admin

After uploading:

- [ ] Image displays correctly on shop page
- [ ] Image loads quickly (< 2 seconds)
- [ ] Image looks good on mobile devices
- [ ] File size is acceptable (checked in DevTools)

---

**Need Help?**
Contact the site administrator if you encounter any issues or have questions.

**Last Updated:** 2025-10-24
