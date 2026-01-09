# Merge Products Feature

## Overview

The Merge Products feature allows administrators to easily group multiple related products into a single multi-product panel without having to edit each product individually. This streamlines the process of organizing products and reduces clutter on the shop page.

## How It Works

### For Admins

#### Step 1: Access the Upload Product Page
1. Navigate to the Admin Upload page (`/admin/upload.html`)
2. Click "Load All Products" to view all existing products

#### Step 2: Enter Merge Mode
1. Click the "Merge Products" button in the toolbar
2. The interface will switch to merge mode:
   - Checkboxes appear on each product (line view: in a column, panel view: in top-left corner)
   - Edit and Delete buttons are hidden
   - Merge controls appear with a group name input field

#### Step 3: Select Products to Merge
1. Click the checkboxes next to products you want to group together
2. Selected products in panel view will have a green border and shadow
3. The selected count updates in real-time (e.g., "3 selected")

#### Step 4: Enter Group Name and Merge
1. Enter a group name in the input field (e.g., "Sauces", "Jams", "Holiday Wreaths")
2. Click "Merge Selected" to apply the grouping
3. Confirm the merge operation in the dialog
4. Products will be updated with the specified group name

#### Step 5: Exit Merge Mode
- Click "Cancel" to exit merge mode without merging
- After successful merge, the interface automatically returns to normal mode
- Click "Load All Products" to see the updated products

### Benefits

1. **Faster Grouping**: Group multiple products in one action instead of editing each individually
2. **Reduced Clutter**: Similar products appear in a single panel on the shop page
3. **Better Organization**: Easily categorize products by type, flavor, size, or occasion
4. **Visual Feedback**: See exactly which products are selected before merging
5. **Flexible**: Can merge 1 to 100 products at once

## Example Use Cases

### Food Products
- **Sauces**: Merge "BBQ Sauce Original", "BBQ Sauce Spicy", "BBQ Sauce Honey"
- **Jams**: Merge "Strawberry Jam", "Blueberry Jam", "Raspberry Jam"
- **Cookies**: Merge "Chocolate Chip", "Oatmeal Raisin", "Peanut Butter"

### Craft Products
- **Wreaths**: Merge "Spring Wreath", "Summer Wreath", "Fall Wreath", "Winter Wreath"
- **Bouquets**: Merge "Small Bouquet", "Medium Bouquet", "Large Bouquet"
- **Ornaments**: Merge "Glass Ornament", "Wood Ornament", "Ceramic Ornament"

## Technical Details

### Backend API

**Endpoint**: `PATCH /api/products/batch`

**Authentication**: Admin only (requires Firebase admin authentication)

**Request Body**:
```json
{
  "productIds": ["productId1", "productId2", "productId3"],
  "productGroup": "Sauces"
}
```

**Response**:
```json
{
  "message": "Successfully updated 3 products",
  "modifiedCount": 3,
  "productGroup": "Sauces"
}
```

**Validation**:
- `productIds` must be a non-empty array
- Each productId must be a valid MongoDB ID
- `productGroup` must be a non-empty string
- Maximum 100 products per batch

**Rate Limiting**: 10 requests per minute (admin mutation limiter)

### Frontend Implementation

**Files Modified**:
- `public/admin/upload.html` - Added merge UI and functionality

**Key Features**:
- Merge mode toggle with visual state management
- Checkbox selection in both line and panel views
- Real-time selected count display
- Visual feedback (green border/shadow for selected items in panel view)
- Input validation before merge
- Confirmation dialog
- Automatic mode exit after successful merge

**Variables**:
- `mergeMode` (boolean) - Tracks whether merge mode is active
- `selectedProducts` (Set) - Stores IDs of selected products

**Functions**:
- `handleCheckboxChange(productId, isChecked)` - Updates selection state
- `updateSelectedCount()` - Updates the selected count display

## Important Notes

1. **Group Names are Case-Sensitive**: "Sauces" and "sauces" create different groups
2. **Existing Groups Preserved**: Products already in a group can be moved to a different group
3. **No Undo**: Merging is permanent (though products can be re-merged or ungrouped by editing individually)
4. **Batch Limit**: Maximum 100 products can be merged at once
5. **Display on Shop Page**: Merged products automatically display in a multi-product panel with dropdown selector

## Related Features

- [Multi-Product Panel](MULTI_PRODUCT_PANEL.md) - Learn about how grouped products are displayed to customers
- [Product Management](../../QUICKSTART.md) - General product management guide

## Security

- Admin authentication required (Firebase Admin Auth)
- Rate limiting prevents abuse (10 requests/minute)
- Input validation on both frontend and backend
- MongoDB injection prevention with validated IDs
- XSS prevention with escaped HTML output

## Future Enhancements

Potential improvements for future versions:
- Bulk ungroup operation
- Group management interface (rename, delete groups)
- Visual group preview before merging
- Suggested groups based on product names
- Undo/redo functionality for merge operations
- Group templates for common product types
