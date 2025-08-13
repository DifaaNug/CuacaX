// Firebase configuration using Web SDK (more compatible with Expo)
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration from google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyBTqXuBDljLGD3rAlxDm86FmpX3qU4jpOQ",
  authDomain: "cuacax-eedc4.firebaseapp.com",
  projectId: "cuacax-eedc4",
  storageBucket: "cuacax-eedc4.firebasestorage.app",
  messagingSenderId: "484327126760",
  appId: "1:484327126760:android:9ca03ef69e882be1883b5d"
};

// Initialize Firebase only once
let app;
let auth: Auth | null;
let db: Firestore | null;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  
  console.log('Firebase initialized successfully with Android config');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create mock services as fallback
  auth = null;
  db = null;
}

// Export Firebase services
export { auth, db };

// Re-export types for convenience
export type { User } from 'firebase/auth';

// For compatibility
export const storage = null;

// Helper function for FCM (if needed later)
export const requestFCMPermission = async (): Promise<string | null> => {
  try {
    console.log('FCM permission requested (Web SDK)');
    return null;
  } catch (error) {
    console.error('Error requesting FCM permission:', error);
    return null;
  }
};
