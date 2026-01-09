# Merge Products Feature - Visual Guide

## User Interface Flow

### 1. Normal Mode (Default View)
```
┌─────────────────────────────────────────────────────────┐
│ Load All Products  │  View as: [Panels]  │  Merge Products│
└─────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Product 1   │  │ Product 2   │  │ Product 3   │
│ [Image]     │  │ [Image]     │  │ [Image]     │
│ BBQ Sauce 1 │  │ BBQ Sauce 2 │  │ Jam 1       │
│ $5.99       │  │ $6.99       │  │ $4.99       │
│ [Edit] [Del]│  │ [Edit] [Del]│  │ [Edit] [Del]│
└─────────────┘  └─────────────┘  └─────────────┘
```

### 2. Merge Mode (After clicking "Merge Products")
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Load All Products  │  View as: [Panels]                                  │
│                    │  3 selected  [Group Name: _______] [Merge] [Cancel] │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ [✓]         │  │ [✓]         │  │ [ ]         │
│ Product 1   │  │ Product 2   │  │ Product 3   │
│ [Image]     │  │ [Image]     │  │ [Image]     │
│ BBQ Sauce 1 │  │ BBQ Sauce 2 │  │ Jam 1       │
│ $5.99       │  │ $6.99       │  │ $4.99       │
└─────────────┘  └─────────────┘  └─────────────┘
  ↑ Green border     ↑ Green border     ↑ Normal border
```

### 3. After Entering Group Name
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Load All Products  │  View as: [Panels]                                  │
│                    │  2 selected  [Group Name: Sauces___] [Merge] [Cancel]│
└──────────────────────────────────────────────────────────────────────────┘

User enters "Sauces" in the group name field
Then clicks "Merge Selected"
```

### 4. Confirmation Dialog
```
┌────────────────────────────────────────────┐
│  Merge Products?                           │
│                                            │
│  Merge 2 products into group "Sauces"?     │
│                                            │
│  [ Cancel ]          [ OK ]                │
└────────────────────────────────────────────┘
```

### 5. After Successful Merge
```
┌─────────────────────────────────────────────────────────┐
│ Load All Products  │  View as: [Panels]  │  Merge Products│
└─────────────────────────────────────────────────────────┘

Success message appears:
"Successfully merged 2 products into group 'Sauces'"

Products are reloaded and now show grouped on shop page
```

## Line View (Table View)

### Normal Mode
```
┌────────────────────────────────────────────────────────────────────┐
│ Name         │ Price  │ Stock │ Type  │ Actions                   │
├────────────────────────────────────────────────────────────────────┤
│ BBQ Sauce 1  │ $5.99  │ 10    │ food  │ [Edit] [Delete]           │
│ BBQ Sauce 2  │ $6.99  │ 5     │ food  │ [Edit] [Delete]           │
│ Jam 1        │ $4.99  │ 8     │ food  │ [Edit] [Delete]           │
└────────────────────────────────────────────────────────────────────┘
```

### Merge Mode
```
┌────────────────────────────────────────────────────────────────────┐
│ Select │ Name         │ Price  │ Stock │ Type                     │
├────────────────────────────────────────────────────────────────────┤
│  [✓]   │ BBQ Sauce 1  │ $5.99  │ 10    │ food                     │
│  [✓]   │ BBQ Sauce 2  │ $6.99  │ 5     │ food                     │
│  [ ]   │ Jam 1        │ $4.99  │ 8     │ food                     │
└────────────────────────────────────────────────────────────────────┘
```

## Shop Page Display (After Merge)

### Before Merge
```
Shop Page - Cottage Food Section
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ BBQ Sauce 1 │  │ BBQ Sauce 2 │  │ Jam 1       │
│ [Image]     │  │ [Image]     │  │ [Image]     │
│ $5.99       │  │ $6.99       │  │ $4.99       │
│ [Add Cart]  │  │ [Add Cart]  │  │ [Add Cart]  │
└─────────────┘  └─────────────┘  └─────────────┘
```

### After Merge (Products grouped as "Sauces")
```
Shop Page - Cottage Food Section
┌─────────────────────────────────────────┐  ┌─────────────┐
│        Sauces (Purple Header)           │  │ Jam 1       │
│ ┌─────────────────────────────────────┐ │  │ [Image]     │
│ │ Select: [BBQ Sauce 1 (10 left) ▼] │ │  │ $4.99       │
│ └─────────────────────────────────────┘ │  │ [Add Cart]  │
│ [Image]                                 │  └─────────────┘
│ BBQ Sauce 1                             │
│ $5.99                                   │
│ Stock: 10 left                          │
│ [Description...]                        │
│ [Add to Cart]                           │
└─────────────────────────────────────────┘

When user selects "BBQ Sauce 2" from dropdown:
- Image changes to BBQ Sauce 2 image
- Price updates to $6.99
- Stock updates to show 5 left
- Description updates
- Smooth fade transition
```

## Color Coding

### Visual Indicators
- **Normal Product Card**: Gray border (#ddd)
- **Selected Product (Merge Mode)**: Green border (#10b981) with green shadow
- **Multi-Product Panel**: Purple gradient header
- **Merge Button**: Purple background (#6e33b7)
- **Cancel Button**: Red background (#ef4444)
- **Merge Selected Button**: Green background (#10b981)

## Button States

### "Merge Products" Button
```
State: Visible in normal mode
Action: Enters merge mode, shows checkboxes
```

### "Merge Selected" Button
```
State: Visible only in merge mode
Enabled when: At least 1 product selected AND group name entered
Action: Sends PATCH request to merge products
```

### "Cancel" Button
```
State: Visible only in merge mode
Action: Exits merge mode, clears selections
```

## Workflow Summary

1. **Admin clicks "Merge Products"**
   - UI enters merge mode
   - Checkboxes appear on all products
   - Merge controls become visible
   - Edit/Delete buttons hide

2. **Admin selects products**
   - Clicks checkboxes to select products
   - Selected count updates in real-time
   - Selected products get visual feedback

3. **Admin enters group name**
   - Types descriptive name (e.g., "Sauces", "Jams")
   - Name is case-sensitive

4. **Admin clicks "Merge Selected"**
   - Validation: checks for selections and group name
   - Shows confirmation dialog
   - Sends batch update request
   - Shows success/error message

5. **System updates products**
   - Backend updates productGroup field
   - Returns success message
   - Frontend reloads products
   - Shop page automatically displays grouped panel

6. **Products appear grouped on shop page**
   - Multi-product panel with dropdown
   - Purple header with group name
   - Smooth product switching
   - All products maintain individual properties
