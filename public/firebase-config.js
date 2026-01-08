// Centralized Firebase Configuration for Bonnie Lass Florals
// This file exports a single FIREBASE_CONFIG object and initialization helper
// to prevent duplication across pages and ensure consistent configuration.

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBo4GNnJd8awnviuIlo9mJ9vaar8jvf6G0",
  authDomain: "bonnie-lass-florals.firebaseapp.com",
  projectId: "bonnie-lass-florals",
  storageBucket: "bonnie-lass-florals.appspot.com",
  messagingSenderId: "1009091302977",
  appId: "1:1009091302977:web:2322ff602eccee4509d8c0",
  measurementId: "G-DQRB98D0WY"
};

// Initialize Firebase app only if not already initialized
function initFirebase() {
  if (!firebase.apps || firebase.apps.length === 0) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
}

// Expose to global scope for use in pages
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.initFirebase = initFirebase;
