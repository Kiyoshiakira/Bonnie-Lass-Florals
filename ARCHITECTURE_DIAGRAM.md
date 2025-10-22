# Architecture Diagram - CSV Batch Upload & Product Editing

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    /admin/upload.html                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  CSV Batch Upload Section                                 │ │
│  │  • File picker (accepts .csv)                             │ │
│  │  • Upload CSV button                                      │ │
│  │  • Results display area                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Single Product Upload Form                               │ │
│  │  • Name, description, price, type, etc.                   │ │
│  │  • Image file upload                                      │ │
│  │  • Submit button                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Product Management Section                               │ │
│  │  • Load All Products button                               │ │
│  │  • Product table with Edit/Delete actions                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Edit Product Modal (overlay)                             │ │
│  │  • Pre-filled form with product data                      │ │
│  │  • Image upload option                                    │ │
│  │  • Save/Cancel buttons                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS Requests
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION LAYER                          │
│                   Firebase Authentication                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Firebase Auth SDK                                        │ │
│  │  • User login/logout                                      │ │
│  │  • Token generation                                       │ │
│  │  • Admin email verification                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Firebase Storage                                         │ │
│  │  • Product images storage                                 │ │
│  │  • URL generation                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Bearer Token
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API SERVER                         │
│              backend/routes/products.js                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Middleware: firebaseAdminAuth                            │ │
│  │  • Verify Bearer token                                    │ │
│  │  • Check admin email list                                 │ │
│  │  • Reject unauthorized requests                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  API Endpoints                                            │ │
│  │                                                           │ │
│  │  POST /api/products                                       │ │
│  │  • Single product upload                                  │ │
│  │  • Multer file handling                                   │ │
│  │  • Save to database                                       │ │
│  │                                                           │ │
│  │  POST /api/products/batch (ADMIN ONLY) 🆕               │ │
│  │  • CSV batch upload                                       │ │
│  │  • Validate batch size (max 100)                          │ │
│  │  • Parse products array                                   │ │
│  │  • Validate each product                                  │ │
│  │  • Save to database (bulk)                                │ │
│  │  • Return success/error results                           │ │
│  │                                                           │ │
│  │  GET /api/products                                        │ │
│  │  • Fetch all products                                     │ │
│  │  • Return JSON array                                      │ │
│  │                                                           │ │
│  │  PUT /api/products/:id (ADMIN ONLY) 🆕                   │ │
│  │  • Validate ObjectId format                               │ │
│  │  • Validate required fields                               │ │
│  │  • Update product in database                             │ │
│  │  • Handle image update                                    │ │
│  │  • Return updated product                                 │ │
│  │                                                           │ │
│  │  DELETE /api/products/:id (ADMIN ONLY)                   │ │
│  │  • Validate ObjectId format                               │ │
│  │  • Delete from database                                   │ │
│  │  • Return success message                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Input Validation                                         │ │
│  │  • MongoDB ObjectId format check                          │ │
│  │  • Required fields validation                             │ │
│  │  • Type checking (numeric fields)                         │ │
│  │  • Batch size limits                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                            │
│                        MongoDB Atlas                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Products Collection                                      │ │
│  │  Schema:                                                  │ │
│  │  {                                                        │ │
│  │    _id: ObjectId,                                         │ │
│  │    name: String (required),                               │ │
│  │    description: String (required),                        │ │
│  │    price: Number (required),                              │ │
│  │    image: String (URL),                                   │ │
│  │    type: String (decor/food),                             │ │
│  │    subcategory: String,                                   │ │
│  │    stock: Number (default: 1),                            │ │
│  │    options: [String],                                     │ │
│  │    featured: Boolean                                      │ │
│  │  }                                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### CSV Batch Upload Flow

```
User                Frontend              Backend              Database
 │                     │                     │                     │
 │  Select CSV file    │                     │                     │
 ├────────────────────>│                     │                     │
 │                     │                     │                     │
 │  Click Upload       │                     │                     │
 ├────────────────────>│                     │                     │
 │                     │                     │                     │
 │                     │  Read & Parse CSV   │                     │
 │                     │─────────────┐       │                     │
 │                     │             │       │                     │
 │                     │<────────────┘       │                     │
 │                     │                     │                     │
 │                     │  Get Firebase Token │                     │
 │                     │─────────────┐       │                     │
 │                     │             │       │                     │
 │                     │<────────────┘       │                     │
 │                     │                     │                     │
 │                     │  POST /api/products/batch                 │
 │                     │  + Bearer Token     │                     │
 │                     │  + products[]       │                     │
 │                     ├────────────────────>│                     │
 │                     │                     │                     │
 │                     │                     │  Verify Token       │
 │                     │                     │────────────┐        │
 │                     │                     │            │        │
 │                     │                     │<───────────┘        │
 │                     │                     │                     │
 │                     │                     │  Validate batch     │
 │                     │                     │────────────┐        │
 │                     │                     │            │        │
 │                     │                     │<───────────┘        │
 │                     │                     │                     │
 │                     │                     │  For each product:  │
 │                     │                     │  • Validate fields  │
 │                     │                     │  • Create document  │
 │                     │                     │  • Save or error    │
 │                     │                     │                     │
 │                     │                     │  Save products      │
 │                     │                     ├────────────────────>│
 │                     │                     │                     │
 │                     │                     │  Confirmation       │
 │                     │                     │<────────────────────┤
 │                     │                     │                     │
 │                     │  Results JSON       │                     │
 │                     │  { success: [],     │                     │
 │                     │    errors: [] }     │                     │
 │                     │<────────────────────┤                     │
 │                     │                     │                     │
 │  Display results    │                     │                     │
 │<────────────────────┤                     │                     │
 │  • Green: Success   │                     │                     │
 │  • Red: Errors      │                     │                     │
 │                     │                     │                     │
```

### Product Edit Flow

```
User                Frontend              Backend              Database
 │                     │                     │                     │
 │  Click "Load        │                     │                     │
 │  Products"          │                     │                     │
 ├────────────────────>│                     │                     │
 │                     │                     │                     │
 │                     │  GET /api/products  │                     │
 │                     ├────────────────────>│                     │
 │                     │                     │                     │
 │                     │                     │  Find all           │
 │                     │                     ├────────────────────>│
 │                     │                     │                     │
 │                     │                     │  Products array     │
 │                     │                     │<────────────────────┤
 │                     │                     │                     │
 │                     │  Products JSON      │                     │
 │                     │<────────────────────┤                     │
 │                     │                     │                     │
 │  View table         │                     │                     │
 │<────────────────────┤                     │                     │
 │                     │                     │                     │
 │  Click "Edit" on    │                     │                     │
 │  a product          │                     │                     │
 ├────────────────────>│                     │                     │
 │                     │                     │                     │
 │                     │  Open modal with    │                     │
 │                     │  pre-filled data    │                     │
 │                     │─────────────┐       │                     │
 │                     │             │       │                     │
 │                     │<────────────┘       │                     │
 │                     │                     │                     │
 │  Modify fields      │                     │                     │
 │  & click Save       │                     │                     │
 ├────────────────────>│                     │                     │
 │                     │                     │                     │
 │                     │  Upload new image   │                     │
 │                     │  (if provided)      │                     │
 │                     │  to Firebase Storage│                     │
 │                     │─────────────┐       │                     │
 │                     │             │       │                     │
 │                     │<────────────┘       │                     │
 │                     │                     │                     │
 │                     │  Get Firebase Token │                     │
 │                     │─────────────┐       │                     │
 │                     │             │       │                     │
 │                     │<────────────┘       │                     │
 │                     │                     │                     │
 │                     │  PUT /api/products/:id                    │
 │                     │  + Bearer Token     │                     │
 │                     │  + updated fields   │                     │
 │                     ├────────────────────>│                     │
 │                     │                     │                     │
 │                     │                     │  Verify Token       │
 │                     │                     │────────────┐        │
 │                     │                     │            │        │
 │                     │                     │<───────────┘        │
 │                     │                     │                     │
 │                     │                     │  Validate ObjectId  │
 │                     │                     │────────────┐        │
 │                     │                     │            │        │
 │                     │                     │<───────────┘        │
 │                     │                     │                     │
 │                     │                     │  Validate fields    │
 │                     │                     │────────────┐        │
 │                     │                     │            │        │
 │                     │                     │<───────────┘        │
 │                     │                     │                     │
 │                     │                     │  Update product     │
 │                     │                     ├────────────────────>│
 │                     │                     │                     │
 │                     │                     │  Updated product    │
 │                     │                     │<────────────────────┤
 │                     │                     │                     │
 │                     │  Success JSON       │                     │
 │                     │<────────────────────┤                     │
 │                     │                     │                     │
 │  Success message    │                     │                     │
 │  Modal closes       │                     │                     │
 │  List refreshes     │                     │                     │
 │<────────────────────┤                     │                     │
 │                     │                     │                     │
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      REQUEST SECURITY                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Firebase Authentication Check                               │
│     • Request has Authorization header?                         │
│     • Format: "Bearer <token>"                                  │
│     • Token is valid?                                           │
│     • Token not expired?                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ YES
┌─────────────────────────────────────────────────────────────────┐
│  2. Admin Email Verification                                    │
│     • Extract email from token                                  │
│     • Email in admin list?                                      │
│       ├── shaunessy24@gmail.com                                 │
│       └── bonnielassflorals@gmail.com                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ YES
┌─────────────────────────────────────────────────────────────────┐
│  3. Input Validation                                            │
│                                                                 │
│     MongoDB ObjectId Check (for edit/delete):                   │
│     • Format: ^[0-9a-fA-F]{24}$                                │
│                                                                 │
│     Required Fields Check:                                      │
│     • name exists and not empty                                 │
│     • description exists and not empty                          │
│     • price is valid number                                     │
│     • type is valid                                             │
│                                                                 │
│     Batch Upload Specific:                                      │
│     • Array length <= 100                                       │
│     • Each product has required fields                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ PASS
┌─────────────────────────────────────────────────────────────────┐
│  4. Database Operation                                          │
│     • Mongoose safe methods used                                │
│     • No raw queries                                            │
│     • Proper error handling                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Response                                                    │
│     • Success: 200 OK + data                                    │
│     • Auth error: 401/403 + error message                       │
│     • Validation error: 400 + error message                     │
│     • Server error: 500 + generic error                         │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Map

```
┌──────────────────┐
│   upload.html    │
└────────┬─────────┘
         │
         ├──────────> CSV File Input
         │              • Read file
         │              • Parse CSV
         │              • Validate format
         │
         ├──────────> Load Products Button
         │              • Fetch all products
         │              • Build table HTML
         │              • Add event listeners
         │
         ├──────────> Edit Button (per product)
         │              • Find product data
         │              • Populate modal form
         │              • Show modal
         │
         ├──────────> Delete Button (per product)
         │              • Show confirmation
         │              • Send DELETE request
         │              • Refresh list
         │
         └──────────> Edit Form Submit
                        • Validate fields
                        • Upload image (if new)
                        • Send PUT request
                        • Close modal
                        • Refresh list
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│           FRONTEND STACK                │
├─────────────────────────────────────────┤
│ • HTML5                                 │
│ • Vanilla JavaScript (ES6+)            │
│ • Firebase SDK (Auth & Storage)        │
│ • Manual CSV parsing                    │
│ • DOM manipulation                      │
│ • Fetch API                             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           BACKEND STACK                 │
├─────────────────────────────────────────┤
│ • Node.js (v18.x)                       │
│ • Express.js                            │
│ • Mongoose (MongoDB ODM)                │
│ • Multer (file uploads)                 │
│ • Papaparse (CSV parsing) 🆕           │
│ • Firebase Admin SDK                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          DATABASE & STORAGE             │
├─────────────────────────────────────────┤
│ • MongoDB Atlas (NoSQL database)        │
│ • Firebase Storage (images)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          AUTHENTICATION                 │
├─────────────────────────────────────────┤
│ • Firebase Authentication               │
│ • Firebase Admin SDK (token verify)     │
│ • Email whitelist authorization         │
└─────────────────────────────────────────┘
```
