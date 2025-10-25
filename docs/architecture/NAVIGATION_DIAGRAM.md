# Navigation Structure Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BONNIE LASS FLORALS                          │
│  Home | About | Shop | Gallery | Contact | 🛒 Cart | [Login]/[👤]│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ GUEST USER (Not Logged In)                                      │
├─────────────────────────────────────────────────────────────────┤
│ Navigation shows:                                                │
│ • Home, About, Shop, Gallery, Contact, Cart                      │
│ • [Login] button (visible)                                       │
│ • Profile Circle (HIDDEN)                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CUSTOMER USER (Regular User - Logged In)                        │
├─────────────────────────────────────────────────────────────────┤
│ Navigation shows:                                                │
│ • Home, About, Shop, Gallery, Contact, Cart                      │
│ • [Login] button (HIDDEN)                                        │
│ • Profile Circle with avatar (VISIBLE, clickable)                │
│                                                                   │
│ Profile Dropdown (on click):                                     │
│ ┌───────────────────────────────────┐                           │
│ │ 👤 John Doe                       │                           │
│ │    john@example.com                │                           │
│ │    Role: Customer                  │                           │
│ ├───────────────────────────────────┤                           │
│ │ ✓ Profile                          │ → /profile.html           │
│ │ ✓ Orders                           │ → /orders.html            │
│ │ ✗ All Orders (Admin) [HIDDEN]     │                           │
│ │ ✗ Upload Product [HIDDEN]         │                           │
│ │ ✓ Logout                           │                           │
│ └───────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ADMIN USER (Admin - Logged In)                                  │
├─────────────────────────────────────────────────────────────────┤
│ Navigation shows:                                                │
│ • Home, About, Shop, Gallery, Contact, Cart                      │
│ • [Login] button (HIDDEN)                                        │
│ • Profile Circle with avatar (VISIBLE, clickable)                │
│                                                                   │
│ Profile Dropdown (on click):                                     │
│ ┌───────────────────────────────────┐                           │
│ │ 👤 Shaun Nelson                   │                           │
│ │    shaunessy24@gmail.com          │                           │
│ │    Role: Admin                    │                           │
│ ├───────────────────────────────────┤                           │
│ │ ✓ Profile                          │ → /profile.html           │
│ │ ✓ Orders                           │ → /orders.html            │
│ │ ✓ All Orders (Admin)              │ → /admin/orders.html     │
│ │ ✓ Upload Product                  │ → /admin/upload.html     │
│ │ ✓ Logout                           │                           │
│ └───────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PAGE HIERARCHY                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ PUBLIC PAGES (All Users):                                        │
│   /index.html         - Home page                                │
│   /about.html         - About page                               │
│   /shop.html          - Product catalog                          │
│   /gallery.html       - Instagram gallery                        │
│   /contact.html       - Contact form                             │
│   /cart.html          - Shopping cart                            │
│   /checkout.html      - Checkout page                            │
│                                                                   │
│ USER PAGES (Logged-in Users Only):                              │
│   /profile.html       - User profile info                        │
│   /orders.html        - Personal order history (NEW!)            │
│                                                                   │
│ ADMIN PAGES (Admin Users Only):                                 │
│   /admin/orders.html  - All customer orders                      │
│   /admin/upload.html  - Upload new products                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION FLOW                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Guest → [Click Login] → Login Modal                            │
│                              ↓                                    │
│                    Email/Password or Google                      │
│                              ↓                                    │
│                    Firebase Authentication                       │
│                              ↓                                    │
│              Check email against admin list                      │
│              (shaunessy24@gmail.com,                            │
│               bonnielassflorals@gmail.com)                      │
│                              ↓                                    │
│         ┌────────────────────┴────────────────────┐             │
│         ↓                                          ↓             │
│    Admin Role                                  Customer Role     │
│  (Show all links)                          (Hide admin links)    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ KEY IMPLEMENTATION POINTS                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 1. Profile Circle Visibility:                                    │
│    • CSS: display: none (default)                                │
│    • JS:  display: flex (when logged in)                         │
│                                                                   │
│ 2. Admin Link Visibility:                                        │
│    • HTML: style="display:none;" (default)                       │
│    • JS:   style.display = "" (for admins)                       │
│    • JS:   style.display = "none" (for customers)                │
│                                                                   │
│ 3. Role Determination:                                           │
│    • Check user.email against admin list                         │
│    • Store in localStorage for persistence                       │
│                                                                   │
│ 4. Consistent Structure:                                         │
│    • Same dropdown HTML on all 11 pages                          │
│    • Relative paths used in admin pages                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```
