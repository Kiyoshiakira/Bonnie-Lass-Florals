# Navigation Links Test Checklist

## Manual Testing Guide for Navigation Updates

### Guest User (Not Logged In)
- [ ] Login button is visible in navigation
- [ ] Profile circle is NOT visible
- [ ] Cannot access profile dropdown
- [ ] Clicking "Orders" or "Profile" link (if somehow accessible) should redirect to login
- [ ] Admin links are NOT visible
- [ ] Can navigate to: Home, About, Shop, Gallery, Contact, Cart

### Customer User (Logged In as Regular User)
- [ ] Login button is hidden
- [ ] Profile circle is visible with user avatar
- [ ] Click profile circle opens dropdown menu
- [ ] Dropdown shows:
  - User name, email, and role (Customer)
  - Profile link (navigates to /profile.html)
  - Orders link (navigates to /orders.html)
  - Upload Product link is HIDDEN
  - All Orders (Admin) link is HIDDEN
  - Logout button
- [ ] Can access profile page
- [ ] Can access orders page (shows only their orders)
- [ ] Cannot access /admin/orders.html (should show "You must be an admin")
- [ ] Cannot access /admin/upload.html (should show access denied or redirect)

### Admin User (Logged In as Admin)
- [ ] Login button is hidden
- [ ] Profile circle is visible with user avatar
- [ ] Click profile circle opens dropdown menu
- [ ] Dropdown shows:
  - User name, email, and role (Admin)
  - Profile link (navigates to /profile.html)
  - Orders link (navigates to /orders.html - their personal orders)
  - All Orders (Admin) link (navigates to /admin/orders.html)
  - Upload Product link (navigates to /admin/upload.html)
  - Logout button
- [ ] Can access profile page
- [ ] Can access orders page (shows only their orders)
- [ ] Can access /admin/orders.html (shows all orders from all customers)
- [ ] Can access /admin/upload.html (can upload new products)

### Navigation Consistency
- [ ] All pages (index, about, shop, gallery, contact, cart, checkout, profile, orders) have identical navigation structure
- [ ] Admin pages (admin/orders, admin/upload) have correct relative paths in navigation
- [ ] Logout button works correctly on all pages
- [ ] After logout, user is redirected and profile circle is hidden

### Admin Emails
The following emails are configured as admin users:
- shaunessy24@gmail.com
- bonnielassflorals@gmail.com

Any other email address logging in will be a Customer role.

## Test Pages
1. /index.html (Home)
2. /about.html
3. /shop.html
4. /gallery.html
5. /contact.html
6. /cart.html
7. /checkout.html
8. /profile.html
9. /orders.html (NEW - customer order history)
10. /admin/orders.html (All orders - admin only)
11. /admin/upload.html (Upload products - admin only)

## Expected Behavior Summary
- Guest users: See Login button only, no profile access
- Customer users: See profile dropdown with Profile and Orders links only
- Admin users: See profile dropdown with Profile, Orders, All Orders (Admin), and Upload Product links
