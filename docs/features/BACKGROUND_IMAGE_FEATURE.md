# Background Image Feature Implementation

## Overview

This document describes the new background image changing functionality added to the Palette Editor at `public/admin/palette.html`.

## Features

### 1. Image Upload
- Upload custom background images directly to Firebase Storage
- Maximum file size: 5MB
- Supported formats: All image types (PNG, JPG, GIF, SVG, etc.)
- Automatic URL generation after upload

### 2. URL Input
- Manually enter direct URLs to background images
- Useful for images hosted elsewhere
- URL validation included

### 3. Preview
- Preview background changes locally before saving
- Changes are temporary until "Save Background" is clicked
- Visual preview box shows the selected image

### 4. Save Site-Wide
- Apply background images across the entire site
- Stored in the database for persistence
- Automatically loaded on all pages via theme-loader.js

### 5. Remove Background
- Reset to default fall-background.svg pattern
- Removes the custom background from the database
- Restores the original site appearance

## User Interface

The new "Background Image" section appears in the palette editor with:

1. **Upload Image** - File picker for uploading images
2. **Or Enter Image URL** - Text input for direct URLs
3. **Preview Box** - Visual preview of the selected background (200px height)
4. **Three Action Buttons**:
   - **Preview Background** - Apply locally without saving
   - **Save Background** - Save and apply site-wide
   - **Remove Background** - Delete custom background

## Technical Details

### Frontend Changes

#### `public/admin/palette.html`
- Added HTML structure for background image section
- Added CSS styles for preview box and controls
- Implemented JavaScript handlers for:
  - File upload with Firebase Storage
  - URL input with validation
  - Preview functionality
  - Save/remove operations
  - Error handling and user feedback

#### `public/theme-loader.js`
- Added background image fetching from API
- Implemented `applyBackground()` function
- Applies background image to `document.body`
- Works alongside existing theme color loading

### Backend Changes

#### `backend/routes/settings.js`
Added three new endpoints:

1. **GET /api/settings/background** (Public)
   - Retrieves saved background image URL
   - Returns `{ backgroundUrl: string | null }`

2. **POST /api/settings/background** (Admin-only)
   - Saves background image URL
   - Validates URL format
   - Requires Firebase admin authentication
   - Request body: `{ backgroundUrl: string }`
   - Response: `{ message: string, backgroundUrl: string }`

3. **DELETE /api/settings/background** (Admin-only)
   - Removes custom background
   - Deletes the `site_background` setting from database
   - Requires Firebase admin authentication
   - Response: `{ message: string }`

### Database Schema

The feature uses the existing `Setting` model with key-value storage:

```javascript
{
  key: 'site_background',
  value: 'https://firebasestorage.googleapis.com/v0/b/...',
  updatedAt: Date
}
```

## Security Features

1. **Authentication Required**: All save/delete operations require admin authentication
2. **File Type Validation**: Only image files can be uploaded
3. **File Size Limit**: 5MB maximum to prevent abuse
4. **URL Validation**: Basic URL format checking
5. **Firebase Storage**: Secure cloud storage with access controls
6. **Error Handling**: Comprehensive error messages for debugging

## Usage Instructions

### For Administrators

1. Navigate to `/admin/palette.html`
2. Scroll to the "Background Image" section
3. Choose one of two options:
   - **Upload**: Click "Choose File" and select an image (max 5MB)
   - **URL**: Enter a direct image URL in the text field
4. Click "Preview Background" to see changes locally
5. Click "Save Background" to apply site-wide
6. To revert: Click "Remove Background"

### For Developers

#### Testing Locally
```bash
# Start the backend server
cd backend
npm start

# In another terminal, serve the frontend
cd public
python3 -m http.server 8080

# Open browser to http://localhost:8080/admin/palette.html
```

#### API Testing
```bash
# Get current background (no auth required)
curl http://localhost:5000/api/settings/background

# Save background (requires admin token)
curl -X POST http://localhost:5000/api/settings/background \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{"backgroundUrl":"https://example.com/image.jpg"}'

# Remove background (requires admin token)
curl -X DELETE http://localhost:5000/api/settings/background \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## Browser Compatibility

The feature uses modern JavaScript APIs and should work in:
- Chrome/Edge 80+
- Firefox 75+
- Safari 13.1+
- Mobile browsers with similar versions

## Performance Considerations

1. **Image Size**: Keep images under 1MB for optimal loading
2. **Format**: Use optimized formats (WebP, optimized JPG)
3. **Caching**: Browser caches the background image
4. **CDN**: Firebase Storage serves images from CDN

## Future Enhancements

Potential improvements:
- Image cropping/editing tools
- Background positioning controls (cover, contain, repeat)
- Opacity/overlay settings
- Multiple background images for different sections
- Scheduled background changes
- Background image presets/gallery
- Image optimization on upload

## Troubleshooting

### Image Not Loading
- Check browser console for errors
- Verify Firebase Storage permissions
- Ensure image URL is accessible
- Check file size (under 5MB)

### Upload Fails
- Verify Firebase Storage is configured
- Check admin authentication
- Ensure file is a valid image
- Check network connection

### Preview Not Working
- Ensure JavaScript is enabled
- Check browser console for errors
- Try a different image URL
- Clear browser cache

## Related Files

- `public/admin/palette.html` - Main UI
- `public/theme-loader.js` - Background loader
- `backend/routes/settings.js` - API endpoints
- `backend/models/Setting.js` - Database model
- `THEMING_SYSTEM_GUIDE.md` - Complete theming documentation

## Support

For issues or questions:
1. Check the console logs for error messages
2. Review the THEMING_SYSTEM_GUIDE.md documentation
3. Contact the development team
