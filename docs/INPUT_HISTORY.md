# Input History Feature Documentation

## Overview
The input history feature allows users to press the UP (↑) and DOWN (↓) arrow keys to cycle through previously entered values for form fields. This is particularly useful for the product upload page where administrators frequently enter similar values.

## How It Works

### For Users
1. **Enter a value** in any field that has input history enabled (Product Name, Description, Subcategory, Options, or Image URL)
2. **Move to the next field** by pressing Tab or clicking elsewhere
3. The value is automatically saved to your browser's local storage
4. **Return to the field** and press the UP arrow key (↑) to see previous entries
5. **Press DOWN** arrow key (↓) to cycle to newer entries
6. **Press UP** repeatedly to go through older entries

### Visual Indicators
- Fields with input history enabled show a tooltip: "Use ↑ / ↓ to cycle previous entries"
- Hover over a field to see the tooltip

### Fields with Input History
The following fields in the product upload form have input history enabled:

#### Single Product Upload Form:
- **Product Name** (`data-history="product_name"`)
- **Description** (`data-history="product_description"`)
- **Subcategory** (`data-history="product_subcategory"`)
- **Options** (`data-history="product_options"`)
- **Image URL** (`data-history="product_image_url"`)

#### Edit Product Modal:
- **Name** (`data-history="product_name"`)
- **Description** (`data-history="product_description"`)
- **Options** (`data-history="product_options"`)
- **Image URL** (`data-history="product_image_url"`)

## Technical Details

### Storage
- History is stored in browser's `localStorage`
- Storage key format: `blf:history:<field_name>`
- Maximum 30 items per field
- Duplicates are automatically removed (most recent kept)

### Behavior
- Empty or whitespace-only values are not saved
- Arrow keys work in both input fields and textareas
- For textareas, arrow keys only trigger history when the cursor is at the start (position 0)
- Modifier keys (Ctrl, Alt, Meta) allow normal OS shortcuts to work

### API
The feature exposes a global API for debugging:
```javascript
// Get history for a field
window.BLFInputHistory.getHistory('product_name')

// Manually add to history
window.BLFInputHistory.pushHistory('product_name', 'New Value')

// Get storage key
window.BLFInputHistory.storageKey('product_name')
// Returns: 'blf:history:product_name'
```

## Files Modified
1. **public/input-history.js** - New file with the input history implementation
2. **public/admin/upload.html** - Added script tag and data-history attributes
3. **test/input-history.test.js** - Comprehensive unit tests

## Testing
Run tests with:
```bash
npm test
```

All 28 tests pass, including 12 tests specifically for the input history feature.
