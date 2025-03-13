import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { checkFirebaseConfig, isFirebaseConfigValid } from "./firebaseConfig";

// Check if Firebase environment variables are set
const isConfigured = checkFirebaseConfig();
const isValid = isFirebaseConfigValid();

if (!isConfigured || !isValid) {
  console.error("Firebase is not properly configured. Some features may not work correctly.");
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  
  // Initialize App Check in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Replace this with your reCAPTCHA v3 site key
    const appCheckSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (appCheckSiteKey) {
      // Pass your reCAPTCHA v3 site key (public key) to activate
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckSiteKey),
        isTokenAutoRefreshEnabled: true
      });
      console.log('Firebase App Check initialized');
    }
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Create dummy objects to prevent app from crashing
  app = null;
  auth = null;
  db = null;
  storage = null;
}

export { app, auth, db, storage };
