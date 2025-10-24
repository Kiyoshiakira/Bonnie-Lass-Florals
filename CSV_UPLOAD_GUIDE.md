# CSV Batch Upload Guide

## Overview
The admin upload page now supports batch uploading products via CSV files. This feature allows administrators to upload multiple products at once, significantly streamlining the product management process.

### Intelligent CSV Parsing
The uploader uses PapaParse, a robust CSV parsing library, to accurately parse CSV files. It intelligently:
- Handles multi-line field values (e.g., product descriptions spanning multiple lines)
- Processes quoted fields containing commas correctly
- Filters out empty rows and non-product data
- Supports RFC 4180 compliant CSV files from Etsy and other platforms
- Accurately counts only valid products (rows with name/title and at least 3 filled fields)

## CSV Format

### Required Columns
Your CSV file should include the following columns (case-insensitive):

- **name** (or TITLE): Product name
- **description** (or DESCRIPTION): Product description
- **price** (or PRICE): Product price (numeric)

### Optional Columns
- **type**: Product type (default: "decor", options: "decor" for Handmade Crafts, "food" for Cottage Foods)
- **subcategory**: Product subcategory
- **stock** (or QUANTITY): Stock quantity (default: 1)
- **options**: Comma-separated list of product options (e.g., "Small,Medium,Large")
- **image** (or IMAGE1): Product image URL

### Example CSV Format

```csv
name,description,price,type,subcategory,stock,options,image
Sample Handmade Craft 1,Beautiful handcrafted item with unique design,45.99,decor,craft,5,"Small,Medium,Large",https://example.com/image1.jpg
Sample Handmade Craft 2,Handcrafted wreath,65.00,decor,wreath,3,,https://example.com/image2.jpg
Sample Product 3,Homemade jam,12.50,food,preserve,10,"8oz,16oz",https://example.com/image3.jpg
```

## Usage Instructions

### 1. Access the Admin Upload Page
Navigate to `/admin/upload.html` (requires admin login)

### 2. Prepare Your CSV File
- Create a CSV file with the required columns
- Ensure all required fields (name, description, price) are populated
- Validate that prices are numeric values
- Check that image URLs are valid (if provided)
- **Note**: The parser intelligently filters out non-product rows, so your CSV can include metadata or header rows that will be automatically skipped
- **Etsy CSV Support**: You can directly upload CSV files exported from Etsy - the parser will extract product information correctly

### 3. Upload the CSV
1. Click the "Choose File" button in the "Batch Upload via CSV" section
2. Select your CSV file
3. Click "Upload CSV"
4. Review the upload results

### 4. Review Upload Results
The system will display:
- Number of successfully uploaded products
- List of uploaded products with their IDs
- Any errors encountered during upload
- Details of failed rows with error messages

## Limitations
- Maximum batch size: 100 products per upload
- All products must have name, description, and price
- Admin authentication required

## Product Editing

### Edit Existing Products
1. Click "Load All Products" to view all products
2. Find the product you want to edit
3. Click the "Edit" button
4. Modify the product details in the modal
5. Optionally upload a new product image
6. Click "Save Changes"

### Delete Products
1. Click "Load All Products" to view all products
2. Find the product you want to delete
3. Click the "Delete" button
4. Confirm the deletion

## Security
- All batch upload and edit operations require admin authentication
- Only users with admin email addresses can access these features
- Input validation is performed on all product data
- MongoDB ObjectId format is validated for all product ID operations

## Troubleshooting

### Common Errors
- **"Invalid CSV data"**: CSV file is empty or improperly formatted
- **"Missing required fields"**: One or more products lacks name, description, or price
- **"Batch size limited to 100 products"**: Your CSV contains more than 100 valid products (rows are accurately counted, excluding empty rows and metadata)
- **"Invalid product ID format"**: The product ID is not a valid MongoDB ObjectId

### CSV Parsing Intelligence
The uploader now uses advanced CSV parsing that:
- **Accurately counts products**: Only rows with valid product data are counted, not empty lines or metadata
- **Handles complex CSVs**: Supports multi-line descriptions and quoted fields
- **Works with Etsy exports**: Directly compatible with CSV files downloaded from Etsy
- **Example**: A 227-line Etsy CSV file is correctly parsed as 31 products

### Tips
- Use UTF-8 encoding for your CSV files
- You can include multi-line descriptions in quoted fields - they will be parsed correctly
- The parser is forgiving and will skip rows that don't look like products
- Test with a small batch first (2-3 products) before uploading larger batches
- Keep a backup of your CSV file before uploading
