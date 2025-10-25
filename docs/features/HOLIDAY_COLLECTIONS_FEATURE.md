# Holiday Collections and Occasions Feature

## Overview
This feature adds the ability to organize Handmade Crafts products by holiday collections and occasions, making it easier for customers to find products for specific events and times of the year.

## New Fields

### Collection Field
The `collection` field allows products to be categorized by holiday or season:
- Christmas
- Halloween
- Easter
- Thanksgiving
- Valentine's Day
- Spring
- Summer
- Fall
- Winter

### Occasion Field
The `occasion` field allows products to be categorized by special events:
- Birthday
- Wedding
- Anniversary
- Baby Shower
- Graduation
- Housewarming
- Retirement
- Sympathy

## Usage

### For Administrators

#### Single Product Upload
1. Navigate to `/admin/upload.html`
2. Fill in the product details
3. Select a holiday collection from the dropdown (optional)
4. Select an occasion from the dropdown (optional)
5. Click "Upload Product"

#### CSV Batch Upload
Add `collection` and `occasion` columns to your CSV file:

```csv
name,description,price,type,subcategory,stock,options,image,collection,occasion
Christmas Wreath,Beautiful handcrafted Christmas wreath,65.00,decor,wreath,5,,https://example.com/wreath.jpg,christmas,
Wedding Bouquet,Elegant silk flower bouquet,125.00,decor,bouquet,3,,https://example.com/bouquet.jpg,,wedding
```

#### Edit Existing Products
1. Navigate to `/admin/upload.html`
2. Click "Load All Products"
3. Click "Edit" on the product you want to update
4. Select a collection and/or occasion
5. Click "Save Changes"

### For Customers

#### Shopping with Filters
1. Navigate to the Shop page
2. Click on "Handmade Crafts" tab
3. Use the new filter dropdowns:
   - **Collection**: Filter by holiday/season (e.g., "Christmas", "Fall")
   - **Occasion**: Filter by event type (e.g., "Wedding", "Birthday")
4. Combine filters with sorting and stock filters for precise results
5. Click "Reset Filters" to clear all filters

#### Example Use Cases
- Find all Christmas products by selecting "Christmas" in the Collection filter
- Find all wedding-related products by selecting "Wedding" in the Occasion filter
- Combine filters to find "Fall" collection items that are "In Stock"

## Technical Implementation

### Database Schema
The `Product` model now includes two new optional fields:
- `collection: String` - Stores the holiday/season collection
- `occasion: String` - Stores the occasion type

### API Changes
The following endpoints now support the new fields:
- `POST /api/products` - Create product with collection/occasion
- `POST /api/products/batch` - Batch create products with collection/occasion
- `PUT /api/products/:id` - Update product with collection/occasion
- `GET /api/products` - Retrieve products (fields included in response)

### Frontend Changes
1. **Upload Page**: Added dropdowns for collection and occasion selection
2. **Shop Page**: Added filter dropdowns for collection and occasion
3. **Shop Logic**: Updated filtering to support collection and occasion filters

## Notes
- Collection and occasion fields are **optional** and apply primarily to Handmade Crafts (type: 'decor')
- Cottage Foods products typically won't use these fields
- Both fields can be left empty if not applicable
- Filters work independently and can be combined with other filters
