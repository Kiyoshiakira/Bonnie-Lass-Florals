# Example: Using Chatbot Merge Products Feature

## Scenario: Organizing Sauce Products

### Initial State
You have the following individual products:
- BBQ Sauce ($5.99)
- Hot Sauce ($4.99)
- Ketchup ($3.99)
- Mustard ($3.99)

Each appears as a separate card on the shop page.

### Step 1: Merge Products into a Group

**Admin says to chatbot:**
```
"Merge BBQ Sauce, Hot Sauce, and Ketchup into group Sauces"
```

**Chatbot response:**
```json
{
  "action": "merge_products",
  "productNames": ["BBQ Sauce", "Hot Sauce", "Ketchup"],
  "groupName": "Sauces"
}
```

✅ **Action completed:** Successfully merged 3 product(s) into group "Sauces"

### Step 2: Add Another Product to the Group

**Admin says to chatbot:**
```
"Add Mustard to the Sauces group"
```

**Chatbot response:**
```json
{
  "action": "add_to_group",
  "productNames": ["Mustard"],
  "groupName": "Sauces"
}
```

✅ **Action completed:** Successfully added 1 product(s) to group "Sauces"

### Result on Shop Page

Instead of 4 separate product cards, customers now see:

```
┌─────────────────────────────────────────┐
│ 🏷️ Sauces                               │
│                                         │
│ Select Product: [BBQ Sauce ▼]          │
│   • BBQ Sauce                           │
│   • Hot Sauce                           │
│   • Ketchup                             │
│   • Mustard                             │
│                                         │
│ ┌───────────┐                           │
│ │  [Image]  │  BBQ Sauce                │
│ └───────────┘                           │
│               Price: $5.99              │
│               Stock: 15                 │
│               Description: Tangy...     │
│                                         │
│               [Add to Cart]             │
└─────────────────────────────────────────┘
```

When a customer selects a different product from the dropdown, the panel updates to show that product's details, price, and image.

## Natural Language Variations

The chatbot understands many ways to express the same command:

### For Merging:
- "Merge BBQ Sauce, Hot Sauce into Sauces group"
- "Group BBQ Sauce and Hot Sauce together as Sauces"
- "Create a panel called Sauces with BBQ Sauce, Hot Sauce"
- "Combine BBQ Sauce, Hot Sauce, Ketchup into Sauces"

### For Adding:
- "Add Mustard to the Sauces group"
- "Put Mustard in the Sauces panel"
- "Include Mustard with the Sauces items"
- "Add Mustard to Sauces"

## Advanced Examples

### Using Product IDs
```
"merge products 507f1f77bcf86cd799439011, 507f1f77bcf86cd799439012 into group Sauces"
```

### Multiple Groups
You can create multiple groups for different categories:

```
Admin: "Merge Strawberry Jam, Blueberry Jam, Raspberry Jam into Jams panel"
Admin: "Group Chocolate Chip Cookies, Oatmeal Raisin Cookies into Cookies"
Admin: "Combine Spring Wreath, Summer Wreath, Fall Wreath into Seasonal Wreaths"
```

### Case-Insensitive Product Names
The chatbot understands product names regardless of capitalization:

```
"merge bbq sauce, hot sauce into sauces"  ✅ Works!
"merge BBQ SAUCE, HOT SAUCE into sauces"  ✅ Works!
"merge BbQ sAuCe, HoT sAuCe into sauces"  ✅ Works!
```

## Benefits in Action

### Before (4 separate cards):
```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ BBQ      │ │ Hot      │ │ Ketchup  │ │ Mustard  │
│ Sauce    │ │ Sauce    │ │          │ │          │
│ $5.99    │ │ $4.99    │ │ $3.99    │ │ $3.99    │
│ [Cart]   │ │ [Cart]   │ │ [Cart]   │ │ [Cart]   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### After (1 merged panel):
```
┌────────────────────────────────┐
│ 🏷️ Sauces                       │
│ [Select: BBQ Sauce ▼]          │
│                                │
│ BBQ Sauce - $5.99              │
│ [Add to Cart]                  │
└────────────────────────────────┘
```

**Space saved:** 75% reduction in vertical space
**User experience:** Better organization and easier browsing

## Error Handling

### Invalid Group Name
```
Admin: "merge BBQ Sauce into group"
Chatbot: ❌ Error: Group name is required and must be a non-empty string
```

### No Products Specified
```
Admin: "merge into Sauces group"
Chatbot: ❌ Error: At least one product name or ID is required
```

### Products Not Found
```
Admin: "merge NonExistent Product into Sauces"
Chatbot: ❌ Error: No products found with the provided names or IDs
```

## Integration with Existing Features

### Works With:
- ✅ Product search and filtering
- ✅ Stock availability display
- ✅ Add to cart functionality
- ✅ Product options (sizes, variations)
- ✅ Product images and carousels
- ✅ Reviews and ratings
- ✅ Extended product details

### Compatible With:
- ✅ Batch product upload
- ✅ Manual product editing
- ✅ Product group field in forms
- ✅ Input history autocomplete
