# Admin Chatbot Demo Examples

This file contains example conversations showing the admin chatbot functionality.

## Example 1: Creating a New Product

**User (Admin):** "I want to add a new Spring Wreath to the store. It should be priced at $45.99 and we have 3 in stock."

**Chatbot Response:**
```
I'll create a new product for you! Here's what I understood:

```json
{
  "action": "create",
  "productData": {
    "name": "Spring Wreath",
    "price": 45.99,
    "description": "",
    "type": "decor",
    "stock": 3
  }
}
```

✅ **Action completed:** Product "Spring Wreath" created successfully with ID: 507f1f77bcf86cd799439011
```

---

## Example 2: Updating Product Stock

**User (Admin):** "Update the Christmas Wreath stock to 10 units"

**Chatbot Response:**
```
I'll update that product for you! Here's what I understood:

```json
{
  "action": "update",
  "productName": "Christmas Wreath",
  "updates": {
    "stock": 10
  }
}
```

✅ **Action completed:** Product "Christmas Wreath" updated successfully
```

---

## Example 3: Changing Product Price

**User (Admin):** "Set the price of Easter Basket to $35.00"

**Chatbot Response:**
```
I'll update the price for you! Here's what I understood:

```json
{
  "action": "update",
  "productName": "Easter Basket",
  "updates": {
    "price": 35.00
  }
}
```

✅ **Action completed:** Product "Easter Basket" updated successfully
```

---

## Example 4: Viewing Store Statistics

**User (Admin):** "Show me the store statistics"

**Chatbot Response:**
```
Here are your current store statistics:

📊 **Statistics:**
- Total Products: 45
- Decor Products: 32
- Food Products: 13
- Out of Stock: 3
- Low Stock (< 5): 8

You have a good variety of products! Consider restocking those 8 low-stock items soon.
```

---

## Example 5: Checking Low Stock Items

**User (Admin):** "Which products are running low on stock?"

**Chatbot Response:**
```
Here are your products with low stock (less than 5 units):

📋 **Products:**
- Autumn Wreath (Stock: 2)
- Easter Basket (Stock: 1)
- Valentine Arrangement (Stock: 4)
- Christmas Garland (Stock: 3)
- Summer Centerpiece (Stock: 2)
- Halloween Wreath (Stock: 4)
- Wedding Bouquet (Stock: 1)
- Birthday Arrangement (Stock: 3)

I recommend restocking these items to avoid running out!
```

---

## Example 6: Finding Out of Stock Items

**User (Admin):** "What items are completely out of stock?"

**Chatbot Response:**
```
Here are the products that are currently out of stock:

📋 **Products:**
- Summer Wreath
- Halloween Centerpiece
- Winter Arrangement

These items need to be restocked as soon as possible. Would you like me to help you update their stock levels?
```

---

## Example 7: Deleting a Product

**User (Admin):** "Delete the discontinued Spring Arrangement"

**Chatbot Response:**
```
I'll remove that product for you. Here's what I understood:

```json
{
  "action": "delete",
  "productName": "Spring Arrangement"
}
```

✅ **Action completed:** Product "Spring Arrangement" deleted successfully

The product has been removed from your inventory.
```

---

## Example 8: Creating Product with Full Details

**User (Admin):** "Create a Christmas Centerpiece for $65.00 with description 'Beautiful festive centerpiece with red and gold accents' in the christmas collection, 5 in stock, type decor"

**Chatbot Response:**
```
I'll create that Christmas Centerpiece for you! Here's what I understood:

```json
{
  "action": "create",
  "productData": {
    "name": "Christmas Centerpiece",
    "price": 65.00,
    "description": "Beautiful festive centerpiece with red and gold accents",
    "type": "decor",
    "stock": 5,
    "collection": "christmas"
  }
}
```

✅ **Action completed:** Product "Christmas Centerpiece" created successfully with ID: 507f1f77bcf86cd799439012

Your Christmas collection now has a beautiful new centerpiece!
```

---

## Example 9: Multiple Field Update

**User (Admin):** "Update the Valentine Wreath: change price to $52.00, stock to 8, and add it to the valentine collection"

**Chatbot Response:**
```
I'll update those fields for the Valentine Wreath. Here's what I understood:

```json
{
  "action": "update",
  "productName": "Valentine Wreath",
  "updates": {
    "price": 52.00,
    "stock": 8,
    "collection": "valentine"
  }
}
```

✅ **Action completed:** Product "Valentine Wreath" updated successfully

All fields have been updated as requested!
```

---

## Example 10: Regular Customer Query (Non-Admin)

**User (Regular Customer):** "Do you have any Christmas wreaths available?"

**Chatbot Response:**
```
Yes! I have several beautiful Christmas wreaths available:

🎄 **Christmas Wreath** - $49.99
A stunning handmade wreath with traditional Christmas colors and decorations. Currently in stock with 10 units available.

🎄 **Premium Christmas Wreath** - $75.00
An elegant wreath featuring premium silk flowers, pine cones, and festive ribbons. We have 5 in stock.

🎄 **Christmas Garland** - $38.99
A beautiful garland that pairs perfectly with our wreaths. Stock is running low (only 3 left!)

Would you like to know more about any of these, or would you like me to help you find something else?
```

Note: Regular users don't see admin functionality - they get the standard customer service experience!

---

## Command Patterns Summary

The chatbot understands various phrasings:

### Create Products:
- "Add a new [product] for $[price]"
- "Create [product] with [details]"
- "I want to add [product]"

### Update Products:
- "Update [product]: [changes]"
- "Change [field] of [product] to [value]"
- "Set [product] [field] to [value]"

### Delete Products:
- "Delete [product]"
- "Remove [product]"
- "Delete product [ID]"

### Statistics:
- "Show stats"
- "What are the statistics?"
- "Give me a store overview"

### Inventory Checks:
- "What's low on stock?"
- "Show low stock items"
- "What's out of stock?"
- "Show out of stock products"
