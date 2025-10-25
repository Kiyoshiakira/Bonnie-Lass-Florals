# CSV Upload Duplicate Detection Feature

## Overview
The CSV batch upload feature now includes intelligent duplicate detection to prevent adding duplicate products from Etsy CSV files or other sources. This is especially useful when product descriptions have been modified but the product names remain similar.

## How It Works

### Smart Duplicate Detection Algorithm
The system uses a multi-criteria approach to identify duplicate products:

1. **String Similarity Calculation**: Uses the Levenshtein distance algorithm to calculate similarity scores between product names and descriptions (0 to 1, where 1 is identical).

2. **Color & Differentiator Detection**: Recognizes key differences in product names such as colors (red, blue, pink, etc.) to avoid false positive matches. For example:
   - "Blue Hydrangea Arrangement" vs "Pink Hydrangea Arrangement" → NOT duplicates
   - "Spring Wreath" vs "Spring Wreath Decoration" → Duplicates

3. **Multi-Threshold Criteria**: A product is considered a duplicate if ANY of these conditions are met:
   - **Name very similar (≥90% match)**: Same product even if description changed
   - **Both similar (name ≥65% + description ≥85%)**: Same product with minor edits
   - **Description very similar (≥92%) with moderate name match (≥60%)**: Likely the same product

### Detection Features
- ✅ Detects exact duplicates
- ✅ Detects products with same name but different descriptions
- ✅ Detects products with minor name variations (typos, added words)
- ✅ Detects products with both name and description changes
- ✅ Distinguishes products with different colors or key attributes
- ✅ Avoids false positives for similar but different products

## Using the Feature

### CSV Upload Process
1. Navigate to `/admin/upload.html` (requires admin login)
2. Select your CSV file with the "Choose File" button
3. Click "Upload CSV"
4. Review the upload results

### Upload Results
The system will display:
- **Added Products**: Products successfully uploaded (with IDs)
- **Skipped Duplicates**: Products that were identified as duplicates
  - Shows the product name
  - Shows which existing product it's similar to
  - Explains why it was skipped
- **Failed Products**: Products that had validation errors

### Example Result Display
```
✅ Batch upload completed: 25 added, 8 skipped (duplicates), 2 failed

Uploaded 25 products:
• Spring Wreath (ID: 507f1f77bcf86cd799439011)
• Summer Bouquet (ID: 507f191e810c19729de860ea)
...

⚠️ Skipped 8 duplicate products:
• Row 3: "Elegant Red Floral Arrangement" - Similar product already exists (similar to "Elegant Red Faux Floral Arrangement")
• Row 7: "Christmas Wreath with Lights" - Similar product already exists (similar to "Christmas Wreath")
...

❌ Failed 2 products:
• Row 15: Missing required fields: name and price are required
• Row 22: Invalid price format
```

## Technical Details

### Backend Changes
**File**: `backend/routes/products.js`

**New Functions**:
- `calculateSimilarity(str1, str2)`: Calculates string similarity using Levenshtein distance
- `isDuplicateProduct(newProduct, existingProduct)`: Determines if two products are duplicates

**Modified Endpoint**: `POST /api/products/batch`
- Fetches all existing products before processing
- Checks each new product against existing products
- Skips products identified as duplicates
- Returns enhanced results with `skipped` array

### Frontend Changes
**File**: `public/admin/upload.html`

**Modified Display Logic**:
- Added display section for skipped duplicates
- Shows duplicate product information in orange
- Lists the similar existing product name

### Dependencies
**Added**: `fastest-levenshtein` (v1.0.16)
- Fast, modern Levenshtein distance implementation
- Used for calculating string similarity
- Zero dependencies, well-maintained

## Examples

### Example 1: Same Product, Modified Description
**Existing Product**:
```
Name: "Elegant Red Faux Floral Arrangement"
Description: "Make a striking statement in your home with this exquisite arrangement featuring vibrant red blooms..."
```

**CSV Upload Attempt**:
```
Name: "Elegant Red Faux Floral Arrangement"
Description: "Beautiful red flowers in a tan ceramic vase"
```

**Result**: ✅ SKIPPED as duplicate (100% name match)

### Example 2: Minor Name Variation
**Existing Product**:
```
Name: "Spring Wreath with Flowers"
Description: "Seasonal door wreath with spring flowers"
```

**CSV Upload Attempt**:
```
Name: "Spring Wreath with Flower"  // Minor typo: "Flower" instead of "Flowers"
Description: "Seasonal door wreath with spring flowers"
```

**Result**: ✅ SKIPPED as duplicate (96% name match, 100% description match)

### Example 3: Different Colors - NOT Duplicates
**Existing Product**:
```
Name: "Blue Hydrangea Arrangement"
Description: "Beautiful blue hydrangeas in a white vase"
```

**CSV Upload Attempt**:
```
Name: "Pink Hydrangea Arrangement"
Description: "Beautiful pink hydrangeas in a white vase"
```

**Result**: ✅ ADDED as new product (different colors detected)

## Configuration

### Adjusting Sensitivity
If you need to adjust the duplicate detection sensitivity, modify the thresholds in `backend/routes/products.js`:

```javascript
// More strict (fewer false duplicates)
const isNameMatch = nameSimilarity >= 0.95;
const isBothMatch = nameSimilarity >= 0.75 && descSimilarity >= 0.90;

// More lenient (catch more duplicates)
const isNameMatch = nameSimilarity >= 0.85;
const isBothMatch = nameSimilarity >= 0.60 && descSimilarity >= 0.80;
```

### Color Words List
The system recognizes these color words as differentiators:
- red, blue, green, yellow, pink, purple, orange
- white, black, brown, tan, gray, grey

To add more differentiators, edit the `colorWords` array in `isDuplicateProduct()`.

## Best Practices

1. **Review Skipped Products**: Always review the list of skipped duplicates to ensure they were correctly identified
2. **Update Existing Products**: If you want to update an existing product's description, use the Edit feature instead of CSV upload
3. **Test with Small Batches**: Try uploading 5-10 products first to see how the detection works with your data
4. **Keep Product Names Consistent**: Use consistent naming conventions to help the detection work better

## Troubleshooting

### Too Many False Duplicates
If the system is marking different products as duplicates:
- Check if the product names are too similar
- Add color or size words to differentiate products
- Consider lowering the similarity thresholds (see Configuration)

### Not Catching Duplicates
If the system is missing obvious duplicates:
- Ensure product names are reasonably similar
- Check that at least one threshold condition is met
- Consider raising the similarity thresholds (see Configuration)

### Performance with Large Batches
- The system checks against ALL existing products
- For catalogs with 1000+ products, batch uploads may take a few seconds
- This is normal and ensures thorough duplicate checking

## Security
- All duplicate detection happens server-side
- Admin authentication required for all operations
- No data is modified without explicit upload request
- Original CSV file is not stored on the server

## Future Enhancements
Potential improvements that could be added:
- Manual review option for potential duplicates before skipping
- Configurable similarity thresholds via admin UI
- Duplicate detection report export
- Bulk merge/update for identified duplicates
