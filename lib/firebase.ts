import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase Cloud Messaging (only in web environment)
let messaging: any = null;
if (typeof window !== 'undefined') {
  try {
    isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
      }
    });
  } catch (error) {
    console.log('Firebase messaging not available:', error);
  }
}

export { messaging };

// Development setup (optional)
if (__DEV__ && typeof window !== 'undefined') {
  console.log('Firebase initialized in development mode');
}

// Helper functions for FCM
export const requestFCMPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) return null;
    
    const vapidKey = process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('VAPID key not found in environment variables. Generate one in Firebase Console.');
      return null;
    }
    
    const token = await getToken(messaging, {
      vapidKey: vapidKey,
    });
    
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export default app;
