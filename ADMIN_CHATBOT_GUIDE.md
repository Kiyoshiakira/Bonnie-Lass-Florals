# Admin Chatbot Guide

## Overview

The Bonnie Lass Florals chatbot now includes powerful admin functionality that allows administrators to manage products directly through natural conversation. When logged in as an admin user, the chatbot transforms into a comprehensive product management tool.

## Accessing Admin Mode

1. **Log in** to your admin account using Firebase authentication
2. The chatbot will **automatically detect** your admin status
3. You'll see an **🛡️ Admin Mode Active** badge in the chatbot window
4. The status indicator will change to **orange** to indicate admin mode

## Admin Commands

### 1. Create Products

Add new products to your store using natural language.

**Command Format:**
```
create product: {name: 'Product Name', price: 29.99, description: 'Description', type: 'decor', stock: 10}
```

**Example:**
```
User: "Create a new product called 'Spring Wreath' priced at $45.99 with 3 units in stock"

Chatbot: "I'll create a new product for you! Here's what I understood:

```json
{
  "action": "create",
  "productData": {
    "name": "Spring Wreath",
    "price": 45.99,
    "description": "Beautiful spring wreath with silk flowers",
    "type": "decor",
    "stock": 3
  }
}
```

✅ Action completed: Product "Spring Wreath" created successfully with ID: 507f1f77bcf86cd799439011"
```

**Supported Fields:**
- `name` (required) - Product name
- `price` (required) - Product price
- `description` - Product description
- `type` - 'decor' (Handmade Crafts) or 'food' (Cottage Foods)
- `stock` - Number of units available (default: 1)
- `subcategory` - Product subcategory (e.g., 'wreaths', 'arrangements')
- `options` - Array of options (e.g., ['Small', 'Medium', 'Large'])
- `collection` - Collection name (e.g., 'christmas', 'halloween', 'easter')
- `occasion` - Occasion type (e.g., 'wedding', 'birthday', 'anniversary')
- `image` - Image URL
- `images` - Array of image URLs

### 2. Update Products

Modify existing product information.

**Command Formats:**
```
update product [ID]: {field: value, ...}
update product [name]: {field: value, ...}
```

**Examples:**
```
User: "Update the Christmas Wreath to be priced at $39.99 with 5 units in stock"

User: "Update product 507f1f77bcf86cd799439011: {stock: 0}"

User: "Set the price of Spring Arrangement to $55.00"
```

**Updatable Fields:**
- name
- description
- price
- type
- stock
- subcategory
- options
- collection
- occasion
- image
- images

### 3. Delete Products

Remove products from your store.

**Command Formats:**
```
delete product [ID]
delete product [name]
```

**Examples:**
```
User: "Delete product 507f1f77bcf86cd799439011"

User: "Delete the Christmas Wreath product"

User: "Remove the Spring Arrangement from the store"
```

### 4. View Statistics

Get insights about your store inventory.

**Show Overall Stats:**
```
User: "Show me the store statistics"
User: "What are the current stats?"
```

**Response:**
```
📊 Statistics:
- Total Products: 45
- Decor Products: 32
- Food Products: 13
- Out of Stock: 3
- Low Stock (< 5): 8
```

**Show Low Stock Items:**
```
User: "Show low stock products"
User: "Which items are running low?"
```

**Response:**
```
📋 Products:
- Autumn Wreath (Stock: 2)
- Easter Basket (Stock: 1)
- Valentine Arrangement (Stock: 4)
- Christmas Garland (Stock: 3)
```

**Show Out of Stock Items:**
```
User: "Show out of stock products"
User: "What's out of stock?"
```

**Response:**
```
📋 Products:
- Summer Wreath
- Halloween Centerpiece
- Winter Arrangement
```

## Natural Language Support

The chatbot uses AI to understand natural language commands, so you don't need to follow exact syntax. These all work:

- "Add a new Christmas wreath for $49.99"
- "Create a product: Easter Basket, price 35.00, in stock 5"
- "I want to add a Spring Arrangement to the shop"
- "Change the price of the Valentine Wreath to $42.50"
- "Update stock for Summer Arrangement to 8 units"
- "Remove the old Halloween decoration"
- "How many products do we have?"
- "What's low on stock?"

## Best Practices

### Creating Products
1. Always include a name and price (required fields)
2. Provide clear descriptions for customer understanding
3. Set appropriate stock levels
4. Use collections and occasions for better organization

### Updating Products
1. Be specific when referencing products (use ID when possible)
2. Update stock levels regularly to reflect inventory
3. Adjust prices as needed for promotions or market changes

### Monitoring Inventory
1. Check low stock regularly to plan restocking
2. Review out-of-stock items weekly
3. Use statistics to understand product distribution

### Product Organization
- **Type**: Use 'decor' for handmade crafts, 'food' for cottage foods
- **Collections**: christmas, halloween, easter, fall, spring, summer, winter
- **Occasions**: wedding, birthday, anniversary, graduation, etc.
- **Subcategories**: wreaths, arrangements, garlands, baskets, etc.

## Security

- Admin commands are **only available** to authenticated admin users
- All actions are **verified server-side** using Firebase authentication
- Admin status is checked via the centralized admin email list
- Non-admin users see the regular customer service chatbot only

## Troubleshooting

**"Product not found" errors:**
- Verify the product name spelling
- Try using the product ID instead
- Check if the product still exists in the database

**Actions not executing:**
- Ensure you're logged in as an admin
- Check that you see the Admin Mode badge
- Verify your admin email is in the system

**Unexpected responses:**
- Try rephrasing your command more clearly
- Break complex requests into simpler steps
- Use the command format examples above

## Regular Customer Features

When not in admin mode, the chatbot still provides:
- Product information and recommendations
- Pricing details
- Stock availability
- Material and ingredient information
- Collection and occasion filtering
- General customer service

## Technical Details

- **AI Model**: Google Gemini 2.5 Flash
- **Authentication**: Firebase Admin SDK
- **Rate Limiting**: 20 requests per minute
- **Response Time**: Typically 1-3 seconds
- **Context**: Maintains full conversation history
- **Product Data**: Real-time access to current inventory

## Support

For issues with the admin chatbot:
1. Check your admin status in the profile menu
2. Verify you're using a supported browser
3. Clear browser cache if commands aren't working
4. Contact technical support with specific error messages

## Future Enhancements

Planned admin features:
- Bulk product operations
- Image upload via chatbot
- Order management queries
- Customer inquiry handling
- Analytics and reporting
- Automated inventory alerts
