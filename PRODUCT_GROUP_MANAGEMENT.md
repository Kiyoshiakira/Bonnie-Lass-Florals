# Product Group Management Guide

## Overview

The Product Group Management feature allows administrators to organize related products into groups (also called "panels"). These groups are displayed together on the shop page with a dropdown selector, making it easy for customers to browse related product variations.

## Key Features

1. **Merge Products**: Combine multiple products into a named group
2. **Unmerge Products**: Remove products from their current group
3. **Remerge Products**: Change products from one group to another
4. **Visual Indicators**: Clear badges showing which products are in groups
5. **Batch Operations**: Manage up to 100 products at once

## How to Use

### Accessing Group Management

1. Log in as an admin
2. Navigate to **Admin → Upload Product**
3. Click **"Load Products"** to view all products
4. Click **"Manage Groups"** button to enter management mode

### Merging Products into a Group

1. Enter **Manage Groups** mode
2. Check the boxes next to products you want to merge
3. Enter a **group name** in the input field (e.g., "Sauces", "Jams", "Wreaths")
4. Click **"Merge Selected"**
5. Confirm the action
6. Products are now grouped together and will display as a panel on the shop page

**Example:**
- Select: BBQ Sauce, Hot Sauce, Sweet Chili Sauce
- Group Name: "Sauces"
- Result: All three appear in one panel with a dropdown selector

### Unmerging Products from a Group

1. Enter **Manage Groups** mode
2. Check the boxes next to products you want to unmerge
3. Click **"Unmerge Selected"** (no group name needed)
4. Confirm the action
5. Products are removed from their groups and the group badge disappears

**Example:**
- Select products currently in "Sauces" group
- Click Unmerge
- Result: Products no longer grouped, can be merged elsewhere

### Remerging Products (Changing Groups)

**Option 1: Direct Remerge**
1. Select products currently in a group (e.g., "Sauces")
2. Enter a new group name (e.g., "Condiments")
3. Click "Merge Selected"
4. Result: Products move from old group to new group

**Option 2: Unmerge Then Merge**
1. Unmerge products from current group
2. Select them with other products
3. Merge into a new group
4. Result: Products are now in the new group

## Visual Indicators

### Product Group Badges

Products in a group show a **purple badge** with the group name:
```
📦 Sauces
```

This appears in:
- **Line View**: In the "Group" column
- **Panel View**: Below the product name

### Selection Mode

When in Manage Groups mode:
- **Checkboxes** appear on each product
- **Selected Count** displays at the top
- **Selected products** in panel view have a green border with shadow

## API Endpoints

### Merge Products
```
PATCH /api/products/batch
Content-Type: application/json
Authorization: Bearer <token>

{
  "productIds": ["id1", "id2", "id3"],
  "productGroup": "Group Name"
}
```

### Unmerge Products
```
DELETE /api/products/batch/unmerge
Content-Type: application/json
Authorization: Bearer <token>

{
  "productIds": ["id1", "id2", "id3"]
}
```

## Best Practices

### Naming Groups

- **Be Descriptive**: Use clear names like "Sauces", "Jams", "Holiday Wreaths"
- **Be Consistent**: Use the same capitalization style throughout
- **Keep it Short**: Group names appear in badges and dropdowns
- **Use Categories**: Group by type, season, or collection

### Organizing Products

1. **Product Variations**: Group products that are variations of the same item
   - Different flavors: BBQ Sauce (Original, Spicy, Honey)
   - Different sizes: Wreath (Small, Medium, Large)
   - Different colors: Candle (Red, Blue, Green)

2. **Related Products**: Group products that belong together
   - All sauces → "Sauces"
   - All jams → "Jams"
   - All cookies → "Cookies"

3. **Seasonal Collections**: Group by season or occasion
   - Christmas decorations → "Christmas Decor"
   - Easter crafts → "Easter Collection"
   - Wedding items → "Wedding Specials"

### When to Unmerge

- Reorganizing product groups
- Moving products to different categories
- Removing discontinued products from groups
- Splitting large groups into smaller, more specific ones

## Workflow Examples

### Example 1: Creating a New Product Group

**Scenario**: You have three sauce products that should be grouped together.

**Steps**:
1. Click "Manage Groups"
2. Select: BBQ Sauce, Hot Sauce, Mustard
3. Group Name: "Sauces"
4. Click "Merge Selected"
5. Result: Products appear together in a "Sauces" panel on shop page

### Example 2: Reorganizing Existing Groups

**Scenario**: You want to combine "Sauces" and "Condiments" into one group.

**Steps**:
1. Click "Manage Groups"
2. Select all products from both groups
3. Group Name: "Sauces & Condiments"
4. Click "Merge Selected"
5. Result: All products now in one unified group

### Example 3: Moving Products Between Groups

**Scenario**: Move Ranch Dressing from "Sauces" to "Salad Dressings".

**Steps**:
1. Click "Manage Groups"
2. Select Ranch Dressing
3. Group Name: "Salad Dressings"
4. Click "Merge Selected"
5. Result: Ranch Dressing moved to new group

### Example 4: Removing a Product from All Groups

**Scenario**: A product was incorrectly grouped and should stand alone.

**Steps**:
1. Click "Manage Groups"
2. Select the product
3. Click "Unmerge Selected"
4. Result: Product no longer grouped, displays individually

## Technical Details

### Database Storage

Product groups are stored in the `productGroup` field of the Product model:

```javascript
{
  name: "BBQ Sauce",
  price: 8.99,
  productGroup: "Sauces"  // Empty string if not grouped
}
```

### Shop Page Display

Products with the same `productGroup` value are automatically grouped together on the shop page:
- Displayed in a single panel
- Dropdown selector to switch between products
- Group name shown as panel title

### Batch Operation Limits

- Maximum 100 products per operation
- Prevents performance issues
- Batch multiple operations for larger changes

### Validation

**Merge**:
- ✅ ProductIds must be valid MongoDB IDs
- ✅ ProductGroup must be non-empty string
- ✅ At least one product must be selected
- ✅ Products must exist in database

**Unmerge**:
- ✅ ProductIds must be valid MongoDB IDs
- ✅ At least one product must be selected
- ✅ Products must exist in database
- ❌ No group name required

## Troubleshooting

### Products Not Showing in Group on Shop Page

**Issue**: Merged products don't appear grouped on shop page.

**Solutions**:
1. Verify products have the same `productGroup` value (check exact spelling and capitalization)
2. Refresh the shop page (Ctrl+F5 to clear cache)
3. Check that products are published and in stock

### Cannot Select Products in Manage Groups Mode

**Issue**: Checkboxes not appearing or not working.

**Solutions**:
1. Ensure you clicked "Manage Groups" button first
2. Reload the products list
3. Check browser console for errors

### Merge/Unmerge Operation Failed

**Issue**: Error message after clicking Merge or Unmerge.

**Solutions**:
1. Check you're logged in as admin
2. Verify your admin token is valid (re-login if needed)
3. Check you selected at least one product
4. For merge: ensure group name is entered
5. Check browser console and network tab for specific error

### Group Badge Not Disappearing After Unmerge

**Issue**: Badge still shows after unmerging.

**Solutions**:
1. Click "Load Products" to refresh the list
2. Verify the unmerge operation succeeded (check response message)
3. Clear browser cache and reload

## Testing

The feature includes comprehensive test coverage:

- **Backend Tests**: `test/merge-products.test.js`, `test/unmerge-products.test.js`
- **Chatbot Tests**: `test/chatbot-merge-products.test.js`
- **Total Tests**: 40+ tests covering all merge/unmerge functionality

Run tests with:
```bash
npm test
```

## Security

- **Authentication Required**: All merge/unmerge operations require admin authentication
- **Authorization**: Uses Firebase Admin token verification
- **Rate Limiting**: 10 requests per minute per IP
- **Input Validation**: All inputs validated server-side
- **XSS Prevention**: HTML escaping on all user inputs

## Related Features

- **Input History**: productGroup field supports autocomplete with history
- **Multi-Product Panels**: Shop page displays grouped products
- **Batch Update Endpoint**: Direct API for programmatic updates
- **Chatbot Commands**: Natural language commands for merging (see CHATBOT_MERGE_FEATURE.md)

## Support

For issues or questions:
1. Check this documentation
2. Review test files for usage examples
3. Check browser console for error messages
4. Contact system administrator
