# Firebase Storage Rules Documentation

## Overview

This document describes the Firebase Storage security rules for Bonnie Lass Florals and provides guidance on modifying them for different security requirements.

## Current Rules Configuration

The `firebase.storage.rules` file at the repository root defines the following access controls:

### Product Images Path (`/product-images/*`)

- **Read Access**: Public (all users)
  - Required for displaying product images on the public website
  - No authentication needed to view images
  
- **Write Access**: Authenticated users only
  - Requires valid Firebase authentication token
  - File size limit: 10MB maximum
  - Content type: Images only (JPEG, PNG, GIF, WebP)

## Deployment

To deploy these rules to Firebase:

### Option 1: Firebase Console
1. Open the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Storage > Rules
4. Copy the contents of `firebase.storage.rules`
5. Paste into the editor
6. Click "Publish"

### Option 2: Firebase CLI
```bash
firebase deploy --only storage
```

## Security Models

### Current: Authenticated User Uploads

The current configuration allows any authenticated user to upload product images. This is suitable for:
- Multi-admin systems
- Trusted user communities
- Internal team environments

**Pros:**
- Simple authentication check
- Easy to implement
- Works with existing auth system

**Cons:**
- Any logged-in user can upload
- No role-based restrictions
- Requires application-level admin checks for sensitive operations

### Alternative: Admin-Only Uploads

To restrict uploads to admin users only, modify the storage rules to check for custom claims:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /product-images/{imageName} {
      // Allow all users to read product images
      allow read: if true;
      
      // Allow only admin users to upload product images
      allow write: if request.auth != null
                  && request.auth.token.admin == true
                  && request.resource.size < 10 * 1024 * 1024
                  && request.resource.contentType.matches('image/.*');
    }
    
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**Implementation Steps:**

1. **Set Admin Custom Claims** on user accounts:
   ```javascript
   // Backend code using Firebase Admin SDK
   const admin = require('firebase-admin');
   
   async function setAdminClaim(uid) {
     await admin.auth().setCustomUserClaims(uid, { admin: true });
   }
   ```

2. **Update storage rules** with the admin-only configuration above

3. **Force token refresh** in client application:
   ```javascript
   // Client-side code
   const user = firebase.auth().currentUser;
   await user.getIdToken(true); // Force refresh to get new claims
   ```

4. **Deploy updated rules** via Firebase Console or CLI

**Pros:**
- Maximum security
- Role-based access control
- Prevents unauthorized uploads

**Cons:**
- More complex setup
- Requires custom claims management
- Need to refresh tokens after claim changes

## Best Practices

1. **Regular Audits**: Review storage rules periodically
2. **File Validation**: Always validate file types and sizes
3. **Application-Level Checks**: Use backend validation in addition to storage rules
4. **Monitoring**: Track storage usage and uploads in Firebase Console
5. **Cost Management**: Set storage quotas and alerts to prevent unexpected costs

## Troubleshooting

### Common Issues

**Error: "User does not have permission to access this object"**
- Solution: Check that the user is authenticated before attempting upload
- Verify that `firebase.auth().currentUser` is not null
- Ensure token is valid and not expired

**Error: "File upload failed"**
- Check file size (must be < 10MB)
- Verify file type is an image (JPEG, PNG, GIF, WebP)
- Ensure Firebase Storage is enabled in project settings

**429 Rate Limit Errors**
- Implement request throttling/batching
- Add delays between consecutive uploads
- Use batch processing for multiple file operations

## Related Documentation

- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Custom Claims Documentation](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Storage Best Practices](https://firebase.google.com/docs/storage/best-practices)

## Security Notes

⚠️ **Important**: Storage rules are enforced by Firebase and cannot be bypassed by client-side code. Always test rules thoroughly before deploying to production.

✅ **Recommended**: Implement application-level authorization checks in addition to storage rules for defense in depth.

## Support

For questions or issues with Firebase Storage:
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Visit [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase-storage)
- Contact the development team
