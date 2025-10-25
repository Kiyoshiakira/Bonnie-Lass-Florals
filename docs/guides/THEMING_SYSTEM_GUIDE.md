# Site-Wide Theming System Guide

This guide explains how to use the new server-stored theming system for Bonnie Lass Florals.

## Overview

The theming system allows administrators to:
- Preview color palettes locally in the browser
- Save custom color themes that apply site-wide
- Create and manage preset palettes
- Import palettes from external sources (e.g., color-hex.com)

## Architecture

### Backend Components

1. **Setting Model** (`backend/models/Setting.js`)
   - Simple key/value store for site settings
   - Stores `site_theme` and `palette_presets`

2. **Settings Routes** (`backend/routes/settings.js`)
   - `GET /api/settings/theme` - Public endpoint to fetch saved theme
   - `POST /api/settings/theme` - Admin-only endpoint to save theme
   - `GET /api/settings/presets` - Public endpoint to fetch presets
   - `POST /api/settings/presets` - Admin-only endpoint to add preset
   - `DELETE /api/settings/presets/:id` - Admin-only endpoint to delete preset
   - `GET /api/settings/background` - Public endpoint to fetch background image URL (NEW)
   - `POST /api/settings/background` - Admin-only endpoint to save background image URL (NEW)
   - `DELETE /api/settings/background` - Admin-only endpoint to remove background image (NEW)

### Frontend Components

1. **Theme Loader** (`public/theme-loader.js`)
   - Lightweight script loaded early in HTML head
   - Fetches saved theme from API
   - Fetches saved background image from API (NEW)
   - Applies CSS variables to `document.documentElement`
   - Applies background image to `document.body` (NEW)
   - Minimizes FOUC (Flash of Unstyled Content)

2. **Palette Editor** (`public/admin/palette.html`)
   - Admin-only UI for theme management
   - Features:
     - Edit 5 color roles: primary, primary2, accent, green, cream
     - Import palettes from comma/newline-separated hex lists
     - Preview changes locally (doesn't save to server)
     - Save theme to apply site-wide
     - Save presets for quick switching
     - View, preview, apply, and delete saved presets
     - **Upload custom background images** (NEW)
     - **Enter background image URLs** (NEW)
     - **Preview and save background images site-wide** (NEW)

3. **CSS Variables** (`public/styles.css`)
   - Themeable CSS custom properties:
     - `--floral-primary`: Pine green (#1b4332)
     - `--floral-primary-2`: Emerald green (#2d6a4f)
     - `--floral-accent`: Fall orange (#ff8c42)
     - `--floral-green`: Sage green (#52b788)
     - `--floral-cream`: Light cream (#f1faee)
   - Used throughout styles.css for headers, gradients, buttons, and backgrounds

## How to Use

### For Administrators

1. **Access the Palette Editor**
   - Navigate to `/admin/palette.html`
   - Login with admin credentials (Firebase)

2. **Edit Colors**
   - Use color pickers or hex input fields
   - Each color role has a visual swatch

3. **Import Palette**
   - Paste comma or newline-separated hex colors
   - Example from color-hex.com:
     ```
     #1b4332
     #2d6a4f
     #ff8c42
     #52b788
     #f1faee
     ```
   - Click "Import Colors"

4. **Preview Locally**
   - Click "Preview Locally" to see changes in your browser
   - Changes are NOT saved yet
   - Only affects your current browser session

5. **Save Site Theme**
   - Click "Save Site Theme" to persist changes
   - Theme will apply to ALL visitors on next page load
   - Requires admin authentication

6. **Manage Presets**
   - Click "Save as Preset" to save current colors as a reusable preset
   - Presets appear in the list below
   - Actions available:
     - **Preview**: Load preset colors into editor (doesn't save)
     - **Apply & Save**: Load and immediately save as site theme
     - **Delete**: Remove preset from database

7. **Manage Background Images** (NEW)
   - Upload a custom background image (max 5MB)
   - Or enter a direct URL to an image
   - Preview the background locally before saving
   - Save to apply the background site-wide
   - Remove background to restore default fall-background.svg

### For Visitors

- The site automatically loads the saved theme
- No action required from visitors
- Theme applies immediately on page load
- Falls back to default colors if no theme is saved

## Color Palette Examples

Inspired by the provided palette images, here are some suggested presets:

### Forest Dreams
```
Primary: #1b4332 (Dark pine green)
Primary 2: #2d6a4f (Emerald green)
Accent: #ff8c42 (Warm orange)
Green: #52b788 (Sage green)
Cream: #f1faee (Light cream)
```

### Autumn Sunset
```
Primary: #8b4513 (Saddle brown)
Primary 2: #d2691e (Chocolate)
Accent: #ff6347 (Tomato)
Green: #9acd32 (Yellow green)
Cream: #faf0e6 (Linen)
```

### Ocean Breeze
```
Primary: #1e3a5f (Navy blue)
Primary 2: #3a7ca5 (Steel blue)
Accent: #ff8c42 (Coral)
Green: #4a9586 (Teal)
Cream: #f0f8ff (Alice blue)
```

### Spring Garden
```
Primary: #2d5f3f (Forest green)
Primary 2: #4a8c5e (Medium green)
Accent: #ff69b4 (Hot pink)
Green: #90ee90 (Light green)
Cream: #fffacd (Lemon chiffon)
```

## Technical Details

### Security

- Admin routes protected with Firebase Admin Auth middleware
- Only authorized admin emails can save themes and presets
- GET endpoints are public (for theme loading)
- Hex color validation on both client and server

### Validation

- All colors must be valid 6-digit hex codes (e.g., #1b4332)
- Server validates theme structure before saving
- Client shows error messages for invalid input

### API Response Format

**GET /api/settings/theme**
```json
{
  "theme": {
    "primary": "#1b4332",
    "primary2": "#2d6a4f",
    "accent": "#ff8c42",
    "green": "#52b788",
    "cream": "#f1faee"
  }
}
```

**GET /api/settings/presets**
```json
{
  "presets": [
    {
      "_id": "1234567890",
      "name": "Forest Dreams",
      "colors": {
        "primary": "#1b4332",
        "primary2": "#2d6a4f",
        "accent": "#ff8c42",
        "green": "#52b788",
        "cream": "#f1faee"
      },
      "createdAt": "2025-10-22T12:00:00.000Z"
    }
  ]
}
```

**GET /api/settings/background** (NEW)
```json
{
  "backgroundUrl": "https://firebasestorage.googleapis.com/v0/b/bonnie-lass-florals.firebasestorage.app/o/backgrounds%2F1234567890-image.jpg?alt=media"
}
```

**POST /api/settings/background** (NEW)
```json
{
  "backgroundUrl": "https://example.com/custom-background.jpg"
}
```
Response:
```json
{
  "message": "Background image saved successfully!",
  "backgroundUrl": "https://example.com/custom-background.jpg"
}
```

## Troubleshooting

### Theme not applying
- Check browser console for errors
- Verify `/api/settings/theme` returns valid JSON
- Check that theme-loader.js is loaded in HTML head

### Cannot save theme
- Ensure you're logged in as admin
- Check admin email is in the authorized list
- Verify Firebase authentication token is valid

### Colors look wrong
- Verify hex codes are valid 6-digit format
- Check CSS variable names match in styles.css
- Clear browser cache and reload

### Background image not loading (NEW)
- Verify the image URL is accessible and valid
- Check Firebase Storage permissions if using uploaded images
- Verify `/api/settings/background` returns valid JSON with backgroundUrl
- Check browser console for CORS or loading errors
- Ensure image file size is under 5MB for uploads

## Future Enhancements

Potential improvements for future versions:
- Font family selection
- Border radius customization
- Shadow intensity controls
- Light/dark mode toggle
- Scheduled theme changes
- Theme preview on other pages before saving
- Export/import theme JSON files
- Theme versioning and rollback
- Background image filters and effects (NEW)
- Background image positioning options (NEW)
- Multiple background images for different pages (NEW)
