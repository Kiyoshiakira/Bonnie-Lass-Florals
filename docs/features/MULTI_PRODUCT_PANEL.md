# Multi-Product Panel Feature

## Overview

The Multi-Product Panel feature allows you to group multiple related products together in a single panel with a dropdown selector. This is particularly useful for displaying product variations (e.g., different sauce flavors, jam varieties) without cluttering the shop page with separate cards.

## How It Works

### For Shop Visitors

When products are grouped together:
1. A panel appears with a distinctive purple header displaying the group name
2. A dropdown selector shows all products in the group with their stock status
3. Selecting a different product from the dropdown:
   - Updates the product image
   - Updates the product name, price, and description
   - Updates the stock information
   - Updates the "Add to Cart" button status
   - All transitions are smooth with fade animations

### For Admins

To group products together:
1. Go to the Shop page and click "Edit Product" on any product
2. Scroll to the "Product Group" field
3. Enter a group name (e.g., "Sauces", "Jams", "Wreaths")
4. Save the changes
5. Repeat for other products you want in the same group (use the exact same group name)

**Important:** Products must have identical `productGroup` values to be grouped together. The comparison is case-sensitive, so "Sauces" and "sauces" would create separate groups.

## Features

### Visual Design
- **Distinctive Styling:** Multi-product panels have a purple gradient header to distinguish them from regular product cards
- **Hover Effects:** Panels respond to hover with subtle animations
- **Stock Indicators:** The dropdown shows stock status for each product (e.g., "BBQ Sauce Spicy (5 left)", "BBQ Sauce Honey (Out of Stock)")

### Functionality
- **Smooth Transitions:** Product switching uses fade animations for a polished user experience
- **Maintains State:** All product features work within panels (reviews, ratings, cart, details)
- **Responsive:** Panels adapt to different screen sizes like regular product cards
- **Backward Compatible:** Products without a `productGroup` display as individual cards

### Filtering and Sorting
Multi-product panels work seamlessly with existing shop filters:
- **Stock filters** apply to all products in grouped panels
- **Collection/Occasion filters** work for decor products
- **Sorting** affects the order of panels and individual cards
- Products within a panel are sorted alphabetically by name

## Database Schema

The feature adds one optional field to the Product model:

```javascript
{
  productGroup: String  // Optional: Group name (e.g., "Sauces")
}
```

## Example Use Cases

1. **Food Products:**
   - Group "BBQ Sauce Original", "BBQ Sauce Spicy", "BBQ Sauce Honey" under "Sauces"
   - Group different jam flavors under "Jams"
   - Group cookie varieties under "Cookies"

2. **Craft Products:**
   - Group seasonal wreaths under "Holiday Wreaths"
   - Group different bouquet sizes under "Silk Bouquets"
   - Group various ornament styles under "Ornaments"

## Technical Details

### Frontend Components

**New Functions:**
- `groupProducts(products)` - Groups products by their productGroup field
- `multiProductPanelToCard(groupName, products)` - Renders a multi-product panel
- `generateProductContent(product, index, panelId, allGroupProducts)` - Generates content for a product within a panel
- `switchProduct(panelId, productIndex)` - Switches between products in a panel

**Updated Functions:**
- `renderProducts()` - Now groups products before rendering
- `applyFilters(type)` - Applies grouping to filtered results

### CSS Classes

**New Classes:**
- `.multi-product-panel` - Main panel container
- `.multi-product-header` - Purple gradient header section
- `.multi-product-group-title` - Group name title
- `.multi-product-selector` - Dropdown container
- `.product-dropdown` - Styled select element
- `.multi-product-content` - Product display area

### Data Storage

Grouped products data is stored in memory:
```javascript
let groupedProductsData = {};  // Maps panelId to products array
```

## Performance Considerations

- Products are sorted once when the panel is created
- Product switching uses client-side rendering (no server requests)
- Fade transitions use CSS opacity for smooth performance
- Images are lazy-loaded regardless of grouping

## Browser Compatibility

The feature uses standard web APIs and is compatible with:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Future Enhancements

Potential improvements for future versions:
- Image thumbnails in dropdown for visual selection
- Keyboard navigation (arrow keys) to switch products
- Ability to compare products side-by-side
- Drag-and-drop reordering within a group (admin)
- Quick-add to cart for multiple products in a group
