# Chatbot Merge Products Feature

## Overview

The AI chatbot now supports merging products into product groups (panels) and adding products to existing groups. This allows admins to organize related products together, which are then displayed as multi-product panels on the shop page.

## New Admin Commands

### 1. Merge Products (Create Product Group)

Merge multiple products into a new product group.

**Format:**
```
merge products [product names or IDs] into group [group name]
```

**Natural Language Examples:**
- "Merge BBQ Sauce, Hot Sauce, and Ketchup into a group called Sauces"
- "Group Strawberry Jam and Blueberry Jam into Jams panel"
- "Create a panel called Cookies with Chocolate Chip, Oatmeal Raisin"
- "Combine Spring Wreath, Summer Wreath into Seasonal Wreaths"

**What It Does:**
- Sets the `productGroup` field for all specified products to the given group name
- Products with the same group name are displayed together in a multi-product panel on the shop page
- Supports product identification by name (case-insensitive) or MongoDB ID

### 2. Add to Group (Add Items to Existing Panel)

Add one or more products to an existing product group.

**Format:**
```
add [product names or IDs] to group [group name]
```

**Natural Language Examples:**
- "Add Mustard to the Sauces group"
- "Add Peanut Butter Cookies to Cookies panel"
- "Put Spring Wreath in the Seasonal Wreaths group"
- "Include Ranch Dressing with the Sauces items"

**What It Does:**
- Sets the `productGroup` field for the specified products to the given group name
- Works the same as merge_products but is more intuitive when adding to an existing group
- Supports product identification by name (case-insensitive) or MongoDB ID

## Technical Details

### Action Format

The chatbot returns these actions in JSON format:

```json
{
  "action": "merge_products",
  "productNames": ["Product 1", "Product 2"],
  "groupName": "Group Name"
}
```

or

```json
{
  "action": "add_to_group",
  "productIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "groupName": "Group Name"
}
```

### Implementation

**Backend:**
- New `merge_products` and `add_to_group` cases in `executeAdminAction()` function
- Uses `Product.updateMany()` to set the `productGroup` field for multiple products
- Supports both product names (case-insensitive regex matching) and MongoDB IDs
- Escapes special regex characters to prevent ReDoS attacks
- Returns success message with count of modified products

**Frontend:**
- Products with the same `productGroup` are automatically grouped on the shop page
- Displayed as multi-product panels with a dropdown to select between products in the group
- Existing functionality - no frontend changes required

### Validation

Both actions validate:
- Group name is required and non-empty
- At least one product name or ID is provided
- Products exist in the database before updating

### Error Handling

- Returns error if no products found with the provided names or IDs
- Logs all merge/add operations for audit trail
- Returns count of successfully modified products

## Example Usage Scenarios

### Scenario 1: Grouping Similar Products
Admin: "Merge BBQ Sauce, Hot Sauce, Sweet Chili Sauce into group Sauces"

Result: All three sauce products are now in the "Sauces" group and will appear together in a panel on the shop page with a dropdown to select between them.

### Scenario 2: Adding to Existing Group
Admin: "Add Ranch Dressing to the Sauces group"

Result: Ranch Dressing is added to the existing "Sauces" group alongside the other sauces.

### Scenario 3: Creating Seasonal Groups
Admin: "Group Christmas Wreath, Holiday Centerpiece, Festive Garland into Christmas Decorations panel"

Result: All three products are grouped under "Christmas Decorations" for easy browsing.

## Benefits

1. **Better Organization**: Related products are grouped together for easier browsing
2. **Space Efficiency**: Multiple products share one panel on the shop page
3. **Flexible Management**: Easy to add products to existing groups or create new groups
4. **Natural Language**: Use conversational commands instead of manual database updates
5. **Product Variants**: Perfect for products with multiple variations (sizes, colors, flavors)

## Testing

Comprehensive test suite added in `test/chatbot-merge-products.test.js`:
- 24 tests covering all aspects of the feature
- Validates command documentation in admin prompt
- Tests implementation of both actions
- Verifies error handling and validation
- Checks logging and response formatting
- All tests passing ✓

## Related Features

- **Product Group Field**: Already exists in Product schema
- **Multi-Product Panels**: Already implemented on shop.js frontend
- **Batch Update Endpoint**: Existing PATCH `/api/products/batch` API for direct updates
- **Input History**: productGroup field supports autocomplete with history

## Future Enhancements

Possible improvements:
- List all existing product groups
- Remove products from groups
- Rename product groups
- View all products in a specific group
