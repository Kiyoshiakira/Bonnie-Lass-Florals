# Chatbot Photo Management & Product Updates Guide

## Overview

The Bonnie Lass Florals chatbot now supports advanced product management with photo upload capabilities and interactive product updates. This guide covers the new features for admin users.

## Features

### 1. Photo Upload for New Products

When creating a new product, you can now attach photos directly in the chatbot:

**Example Conversation:**
```
You: Create a new product called "Spring Wreath" for $45
Bot: [Creates product]
You: *click attach button, select photos*
Bot: ⏳ Uploading photos...
     ✅ Uploaded 3 photo(s) successfully!
     [Photos are automatically added to the product]
```

**Alternative Method - Using URLs:**
```
You: Add a new product "Rose Bouquet" for $35, images: https://example.com/rose1.jpg, https://example.com/rose2.jpg
Bot: ✅ Product created with 2 photos
```

### 2. Add Photos to Existing Products

Add photos to products that are already in the system:

**Example Conversation:**
```
You: Add photos to Christmas Wreath
Bot: [Lists available products if needed]
You: *click attach button, select new photos*
Bot: ⏳ Uploading photos...
     ✅ Successfully added 2 photo(s) to "Christmas Wreath". Total photos: 5
```

**Natural Language Examples:**
- "Upload images to Spring Wreath"
- "Add these photos to Easter Basket"
- "I want to add more pictures to the Fall Centerpiece"

### 3. Remove Photos from Products

Remove specific photos from a product:

**By URL:**
```
You: Remove photo https://firebasestorage.googleapis.com/... from Christmas Wreath
Bot: ✅ Successfully removed 1 photo(s) from "Christmas Wreath". Remaining photos: 4
```

**By Position:**
```
You: Delete the first photo from Spring Wreath
Bot: ✅ Successfully removed 1 photo(s) from "Spring Wreath". Remaining photos: 3
```

**Natural Language Examples:**
- "Remove the second image from Easter Basket"
- "Delete photo 3 from Fall Centerpiece"
- "Remove images from Holiday Arrangement: [url1, url2]"

### 4. List All Products

View all products to select one for updates:

**Example Conversation:**
```
You: List all products
Bot: 📋 Products:
     - Christmas Wreath (ID: 507f1f77...) (Stock: 5) - $39.99 [decor]
     - Spring Bouquet (ID: 507f191e...) (Stock: 3) - $29.99 [decor]
     - Chocolate Cookies (ID: 507f191e...) (Stock: 12) - $8.99 [food]
     ...
```

**Alternative Phrases:**
- "Show me all products"
- "What products do we have?"
- "Get product list"

### 5. Update Product Information

Update existing product details:

**Example Conversation:**
```
You: Update Christmas Wreath: price $42.99, stock 10
Bot: ✅ Product "Christmas Wreath" updated successfully
```

**Natural Language Examples:**
- "Change the price of Spring Wreath to $35"
- "Set stock to 5 for Fall Centerpiece"
- "Update Easter Basket: add description 'Beautiful handmade basket'"

### 6. Interactive Product Selection

When you want to update a product but don't specify which one:

**Example Conversation:**
```
You: I want to update a product
Bot: Here are all available products. Please select one or tell me the product name.
     [Lists all products]
You: Christmas Wreath
Bot: What would you like to update about Christmas Wreath?
You: Change the price to $45 and add care instructions: Dust gently, avoid direct sunlight
Bot: ✅ Product "Christmas Wreath" updated successfully
```

## How to Use Photo Upload

### Step 1: Click the Attach Button
- Look for the paperclip icon (📎) to the left of the text input
- Click it to open the file picker

### Step 2: Select Photos
- Choose one or multiple image files (JPEG, PNG, GIF, WebP)
- Each file must be under 10MB
- You can select multiple files at once

### Step 3: Preview Selected Photos
- Selected photos will appear as thumbnails above the input
- Click the × button on any thumbnail to remove it
- You can add more photos by clicking the attach button again

### Step 4: Send Your Message
- Type your message (e.g., "Create new product 'Rose Arrangement' for $50")
- Or if you're adding to existing: "Add these photos to Spring Wreath"
- Click send - the photos will upload automatically

### Step 5: Wait for Upload
- The bot will show "⏳ Uploading photos..."
- After upload: "✅ Uploaded X photo(s) successfully!"
- Photos are automatically uploaded to Firebase Storage
- The URLs are added to your product

## Advanced Features

### Bulk Photo Management

You can manage photos for multiple products in sequence:

```
You: Add photos to Christmas Wreath
Bot: [uploads photos]
You: Now add different photos to Spring Bouquet
Bot: [uploads photos]
```

### Creating Products with Extended Details and Photos

Combine all features in one command:

```
You: Create "Lavender Wreath" for $38. Made with silk lavender, eucalyptus, and twine. 
     Dimensions: 18 inches diameter. Care: dust monthly, avoid moisture.
*attach 3 photos*
Bot: ✅ Product "Lavender Wreath" created successfully with:
     - 3 photos
     - Materials: silk lavender, eucalyptus, and twine
     - Dimensions: 18 inches diameter
     - Care instructions: dust monthly, avoid moisture
```

### Photo URL Management

The chatbot intelligently handles photo URLs:
- Automatically uploads files to Firebase Storage
- Supports direct URL input for existing images
- Prevents duplicate photos in the images array
- Updates the primary image if none exists

## Technical Details

### Supported File Types
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### File Size Limits
- Maximum file size: 10MB per image
- No limit on number of images per product

### Storage
- All photos are uploaded to Firebase Storage
- Stored in the `product-images/` folder
- Filenames are timestamped to prevent conflicts
- Photos are accessible via public URLs

### Image Array Structure
Products store images in two fields:
- `image`: The primary/featured image URL
- `images`: Array of all image URLs
- The first image in the `images` array becomes the primary image if none is set

## Troubleshooting

### "Firebase Storage is not available"
- Make sure you're logged in as an admin
- Refresh the page to reload Firebase
- Check that Firebase is properly configured

### "File size exceeds 10MB limit"
- Compress your images before uploading
- Use online tools like TinyPNG or ImageOptim
- Consider using WebP format for better compression

### "Invalid file type"
- Only image files are supported
- Make sure your file has the correct extension
- Convert files to JPEG or PNG if needed

### Photos not appearing
- Wait for the upload confirmation message
- Check that the product was created/updated successfully
- Refresh the products list to see changes

## Best Practices

1. **Optimize Images**: Compress images before upload for faster loading
2. **Descriptive Names**: Use clear product names for easy identification
3. **Multiple Angles**: Upload 3-5 photos showing different angles
4. **Consistent Quality**: Use similar photo sizes and quality across products
5. **Test First**: Try with one photo before bulk uploading
6. **Check Results**: Verify photos appear correctly in the shop

## Security

- Only admin users can upload photos
- Admin status is verified server-side
- All file uploads are validated for type and size
- Firebase Storage security rules control access
- Authentication required for all admin actions

## API Actions Reference

The chatbot uses these new actions behind the scenes:

- `list_products`: Lists all products with IDs
- `add_photos`: Adds photos to a product
  - Parameters: `productName` or `productId`, `newImages` array
- `remove_photos`: Removes photos from a product
  - Parameters: `productName` or `productId`, `imagesToRemove` array

All actions are triggered through natural language - you don't need to know the technical details!
