// Usage: node backend/scripts/set-admin-claim.js user@example.com
// Requires admin credentials via GOOGLE_APPLICATION_CREDENTIALS (service account JSON)
// Uses the repo's firebase-admin initializer at backend/utils/firebaseAdmin.js

const admin = require('../utils/firebaseAdmin');

async function setAdminByEmail(email) {
  if (!email) {
    console.error('Usage: node backend/scripts/set-admin-claim.js user@example.com');
    process.exit(1);
  }
  try {
    const user = await admin.auth().getUserByEmail(email);
    console.log('Found user:', user.uid, user.email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Set custom claim admin=true for ${email}`);
    console.log('Done. Ask the user to refresh their ID token with firebase.auth().currentUser.getIdToken(true).');
  } catch (err) {
    console.error('Error setting admin claim:', err.message || err);
    process.exit(1);
  }
}

setAdminByEmail(process.argv[2]);
