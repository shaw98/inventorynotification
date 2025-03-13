/**
 * Simple script to test admin access in Firebase
 * 
 * Usage:
 * 1. Make sure your .env.local file has your Firebase configuration
 * 2. Run: node -r dotenv/config scripts/test-admin-access.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs 
} = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Your email to test
const TEST_EMAIL = "shaw98@gmail.com";

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// Check if Firebase config is available
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("❌ Firebase configuration is missing. Make sure your .env.local file is set up correctly.");
  process.exit(1);
}

// Print the Firebase config for debugging
console.log("Firebase Config:", {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
  databaseURL: firebaseConfig.databaseURL
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAdminAccess() {
  console.log(`Testing admin access for: ${TEST_EMAIL}`);
  
  try {
    // Try to get all admins
    console.log("Attempting to get all admins...");
    const adminsRef = collection(db, "admins");
    const adminsSnapshot = await getDocs(adminsRef);
    
    console.log(`Found ${adminsSnapshot.size} admin documents:`);
    adminsSnapshot.forEach(doc => {
      console.log(`- Admin ID: ${doc.id}, Email: ${doc.data().email}, Initial Admin: ${doc.data().isInitialAdmin}`);
    });
    
    // Try to find the specific admin
    console.log(`\nLooking for admin with email: ${TEST_EMAIL}`);
    const adminQuery = query(
      collection(db, "admins"),
      where("email", "==", TEST_EMAIL.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(adminQuery);
    
    if (querySnapshot.empty) {
      console.log(`❌ No admin found with email: ${TEST_EMAIL}`);
    } else {
      const doc = querySnapshot.docs[0];
      console.log(`✅ Found admin with ID: ${doc.id}`);
      console.log("Admin data:", {
        email: doc.data().email,
        name: doc.data().name,
        addedBy: doc.data().addedBy,
        addedAt: doc.data().addedAt.toDate(),
        isInitialAdmin: doc.data().isInitialAdmin
      });
    }
  } catch (error) {
    console.error("❌ Error testing admin access:", error);
  }
  
  process.exit(0);
}

// Run the function
testAdminAccess(); 