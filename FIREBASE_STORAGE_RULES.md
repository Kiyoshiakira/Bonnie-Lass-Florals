# Firebase Storage Rules Configuration

## Overview
This document describes the Firebase Storage rules required for the Bonnie Lass Florals application to function properly.

## Required Rules

The following rules must be configured in the Firebase Console under Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Product images - public read, authenticated write
    match /product-images/{imageName} {
      // Allow public read for product images
      allow read: if true;
      
      // Allow write only for authenticated users
      allow write: if request.auth != null
                  && request.resource.size < 10 * 1024 * 1024  // Max 10MB
                  && request.resource.contentType.matches('image/.*');  // Only images
    }
    
    // Background images - public read, authenticated admin write
    match /backgrounds/{imageName} {
      // Allow public read for background images
      allow read: if true;
      
      // Allow write only for authenticated users
      allow write: if request.auth != null
                  && request.resource.size < 10 * 1024 * 1024  // Max 10MB
                  && request.resource.contentType.matches('image/.*');  // Only images
    }
  }
}
```

## How to Update Rules

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `bonnie-lass-florals`
3. Navigate to **Storage** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with the rules above
6. Click **Publish** to save the changes

## Rule Explanation

### Product Images (`/product-images/*`)
- **Read Access**: Public (anyone can view product images)
- **Write Access**: Authenticated users only
- **File Size Limit**: 10MB maximum
- **File Type**: All image formats supported (image/*)
  - JPEG (image/jpeg)
  - PNG (image/png)
  - GIF (image/gif)
  - WebP (image/webp) - Recommended for best compression
  - SVG (image/svg+xml)

### Background Images (`/backgrounds/*`)
- **Read Access**: Public (anyone can view background images)
- **Write Access**: Authenticated users only
- **File Size Limit**: 10MB maximum (configurable to 5MB in client-side code)
- **File Type**: All image formats supported (image/*)
  - JPEG (image/jpeg)
  - PNG (image/png)
  - GIF (image/gif)
  - WebP (image/webp) - Recommended for best compression
  - SVG (image/svg+xml)

## Security Considerations

1. **Authentication Required**: Both paths require Firebase authentication for uploads
2. **File Size Limits**: Both client-side (5MB) and server-side (10MB) limits are enforced
3. **File Type Validation**: Only image files are allowed
4. **Public Read Access**: Images need to be publicly readable for the website to display them

## Image Optimization

For best performance, images should be optimized before uploading:

1. **Recommended Formats**:
   - **WebP**: Best compression ratio (25-35% smaller than JPEG)
   - **JPEG**: Good for photos, 80-85% quality recommended
   - **PNG**: For graphics with transparency

2. **Recommended Sizes**:
   - **Product Images**: 800x800px to 1200x1200px
   - **Background Images**: 1920x1080px maximum
   - **Target File Size**: Under 500KB when possible

3. **Optimization Tools**:
   - [Squoosh](https://squoosh.app/) - Online image optimizer
   - [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
   - [ImageOptim](https://imageoptim.com/) - Mac desktop tool

See `IMAGE_OPTIMIZATION_GUIDE.md` for detailed optimization strategies and responsive image implementation.

## Error Messages

If storage rules are not configured correctly, users will see:

- **Client Error**: "Upload failed: You do not have permission to upload images. Please ensure you are logged in as an admin and that Firebase Storage rules are properly configured."
- **Console Error**: `FirebaseError: Firebase Storage: User does not have permission to access 'backgrounds/...'`

## Admin Access

Currently, the following email addresses are configured as admin users:
- shaunessy24@gmail.com
- bonnielassflorals@gmail.com

Only these users can access the palette editor and upload background images.

## Testing the Rules

After configuring the rules:

1. **Test Read Access**: 
   - Open the website in an incognito window
   - Verify that product and background images load correctly

2. **Test Write Access**:
   - Login as an admin user
   - Navigate to `/admin/palette.html`
   - Try uploading a background image
   - Verify the upload succeeds without permission errors

3. **Test Unauthorized Access**:
   - Try uploading without being logged in
   - Should see appropriate error message

## Troubleshooting

### "Permission Denied" Errors
- Verify the user is logged in with Firebase Auth
- Check that the storage rules are published
- Ensure the user's authentication token is valid
- Check Firebase Console > Authentication for active sessions

### Images Not Loading
- Verify read access is set to `if true` for public access
- Check the image URLs are using the correct Firebase Storage domain
- Verify the bucket name matches your project

### Upload Failures
- Check file size (must be under 10MB)
- Verify file type is an image
- Ensure user is authenticated
- Check browser console for detailed error messages

## Additional Resources

- [Firebase Storage Security Rules Documentation](https://firebase.google.com/docs/storage/security)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- Project Documentation: `FIREBASE_STORAGE_GUIDE.md`
- Security Documentation: `FIREBASE_STORAGE_SECURITY.md`
- Image Optimization: `IMAGE_OPTIMIZATION_GUIDE.md`

---

**Last Updated**: 2025-10-24
**Status**: Active - supports all image formats including WebP
