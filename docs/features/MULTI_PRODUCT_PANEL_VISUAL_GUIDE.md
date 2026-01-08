# Multi-Product Panel Visual Guide

## What It Looks Like

### Desktop View (3 columns)
```
┌─────────────────────────────────────────────────────────────────────┐
│                           SHOP PAGE                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────┐│
│  │ 🎨 SAUCES            │  │ Regular Product Card │  │ Another Card││
│  │ ─────────────────────│  │                      │  │             ││
│  │ Select Product: ▼    │  │  [Product Image]     │  │ [Image]     ││
│  │ BBQ Sauce Original   │  │                      │  │             ││
│  │                      │  │  Product Name        │  │ Name        ││
│  │ [Product Image]      │  │  $12.99              │  │ $8.99       ││
│  │                      │  │  Stock: 10           │  │ In Stock    ││
│  │ BBQ Sauce Original   │  │                      │  │             ││
│  │ $8.99                │  │  Description...      │  │ Desc...     ││
│  │ Stock: 10            │  │                      │  │             ││
│  │                      │  │  [Add to Cart]       │  │ [Add Cart]  ││
│  │ Classic sauce...     │  └──────────────────────┘  └─────────────┘│
│  │                      │                                            │
│  │ [Add to Cart]        │                                            │
│  └──────────────────────┘                                            │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Visual Differences

### Multi-Product Panel (Grouped Products)
- **Header Color**: Purple gradient (distinctive from regular cards)
- **Border**: Same as regular cards (light sage)
- **Header Section**: Contains group title and dropdown selector
- **Content Area**: Shows selected product (same layout as regular card)
- **Hover Effect**: Same lift and scale as regular cards

### Regular Product Card (Ungrouped Products)
- **No Header**: Product info starts immediately
- **Border**: Light sage green
- **No Dropdown**: Just the single product
- **Top Bar**: Green gradient accent at the top

## Component Breakdown

### Multi-Product Panel Structure
```
┌──────────────────────────────────────────┐
│ HEADER (Purple Gradient Background)      │
│  ┌────────────────────────────────────┐  │
│  │ 🎨 PRODUCT GROUP NAME              │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ Select Product: [Dropdown ▼]      │  │
│  │  • Product A (10 in stock)         │  │
│  │  • Product B (5 left)              │  │
│  │  • Product C (Out of Stock)        │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│ CONTENT AREA (White Background)          │
│  ┌────────────────────────────────────┐  │
│  │ [Product Image]                    │  │
│  └────────────────────────────────────┘  │
│  Product Name                             │
│  $XX.XX                                   │
│  Stock Status                             │
│  ★★★★☆ (rating)                          │
│                                           │
│  Description text...                      │
│                                           │
│  [More Details]                           │
│  [Add to Cart]                            │
│  [View Reviews]                           │
└──────────────────────────────────────────┘
```

## Dropdown Behavior

### When Closed
```
┌─────────────────────────────────┐
│ Select Product: [BBQ Sauce Original ▼] │
└─────────────────────────────────┘
```

### When Opened
```
┌─────────────────────────────────┐
│ Select Product: [BBQ Sauce Original ▼] │
├─────────────────────────────────┤
│ BBQ Sauce Original (selected)   │
│ BBQ Sauce Spicy (5 left)        │
│ BBQ Sauce Honey (Out of Stock)  │
│ BBQ Sauce Teriyaki               │
└─────────────────────────────────┘
```

## Product Switching Animation

### Before Switch
```
Product A displayed
Opacity: 1.0
```

### During Switch (200ms)
```
Product A fading out
Opacity: 0.0 (fading)
```

### After Switch
```
Product B displayed
Opacity: 1.0 (fading in)
```

## Color Scheme

### Multi-Product Panel Header
- **Background**: Linear gradient from `#f6f2fe` to `#faf5ff` (light purple)
- **Border**: `#e9d5ff` (purple)
- **Title Text**: `#7c3aed` (purple)
- **Top Accent**: Linear gradient `#d946ef` → `#a855f7` → `#8b5cf6` (purple gradient)

### Dropdown Selector
- **Background**: White `#fff`
- **Border**: `#d8b4fe` (light purple)
- **Hover Border**: `#a855f7` (darker purple)
- **Focus Border**: `#7c3aed` (deep purple)
- **Text Color**: `#6b21a8` (purple)

### Regular Product Cards (for comparison)
- **Background**: White `#fff`
- **Border**: `#95d5b2` (sage green)
- **Top Accent**: Linear gradient `#2d6a4f` → `#40916c` → `#52b788` (green gradient)

## Responsive Behavior

### Desktop (> 1200px)
- 3 columns layout
- Panels and cards mixed together
- Full dropdown visible

### Tablet (801px - 1200px)
- 2 columns layout
- Panels stack with cards
- Full dropdown visible

### Mobile (≤ 800px)
- 1 column layout
- Panels take full width
- Dropdown becomes more prominent
- Touch-friendly sizing

## Example Shop Page with Mixed Content

```
Desktop View:
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ 🎨 Sauces      │ │ Regular Card   │ │ Regular Card   │
│ [dropdown]     │ │                │ │                │
│ ...            │ │ ...            │ │ ...            │
└────────────────┘ └────────────────┘ └────────────────┘

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ 🎨 Jams        │ │ Regular Card   │ │ Regular Card   │
│ [dropdown]     │ │                │ │                │
│ ...            │ │ ...            │ │ ...            │
└────────────────┘ └────────────────┘ └────────────────┘
```

## Key Visual Indicators

1. **Purple Header** = Multi-product panel
2. **Green Top Bar** = Regular product card
3. **Dropdown Arrow** = Can switch products
4. **Stock in Dropdown** = "(5 left)" or "(Out of Stock)"
5. **Fade Transition** = Product is switching

## User Experience Flow

1. **Browse** → See both regular cards and multi-product panels
2. **Identify** → Purple header indicates grouped products
3. **Select** → Click dropdown to see all products in group
4. **Switch** → Select different product from dropdown
5. **Fade** → Content smoothly transitions
6. **Shop** → Add selected product to cart

## Admin Experience

When editing a product:
```
┌─────────────────────────────────────┐
│ Edit Product Modal                  │
├─────────────────────────────────────┤
│ Product Name: [BBQ Sauce Original]  │
│ Price: [$8.99]                      │
│ Type: [Cottage Food ▼]              │
│ Stock: [10]                         │
│ Options: [12oz, 16oz]               │
│                                     │
│ Product Group: [Sauces]  ← NEW!     │
│ ℹ️ Group similar products together   │
│                                     │
│ [Save Changes] [Cancel]             │
└─────────────────────────────────────┘
```

## Benefits Visualization

### Before (Cluttered)
```
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│BBQ  │ │BBQ  │ │BBQ  │ │BBQ  │ │Other│
│Orig │ │Spicy│ │Honey│ │Teri │ │Prod │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘
```

### After (Organized)
```
┌──────────────┐ ┌─────┐ ┌─────┐
│ 🎨 Sauces    │ │Other│ │Other│
│ [Dropdown ▼] │ │Prod │ │Prod │
│  • Original  │ └─────┘ └─────┘
│  • Spicy     │
│  • Honey     │
│  • Teriyaki  │
└──────────────┘
```

## Accessibility

- Keyboard navigation works with dropdown
- Screen readers announce group names
- Stock status clearly indicated
- High contrast text for readability
- Touch targets sized appropriately

## Performance

- No page reload on product switch
- Smooth 60fps animations
- Minimal DOM manipulation
- Efficient event delegation
- Client-side only (fast)
