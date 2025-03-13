/**
 * Simple script to add an admin user to Firebase
 * 
 * Usage:
 * 1. Make sure your .env.local file has your Firebase configuration
 * 2. Run: node -r dotenv/config scripts/add-admin.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs 
} = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Your email to add as admin
const ADMIN_EMAIL = "shaw98@gmail.com";

// Get Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if Firebase config is available
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("❌ Firebase configuration is missing. Make sure your .env.local file is set up correctly.");
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addAdmin() {
  console.log(`Adding admin user: ${ADMIN_EMAIL}`);
  
  try {
    // Check if admin already exists
    const adminQuery = query(
      collection(db, "admins"),
      where("email", "==", ADMIN_EMAIL.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(adminQuery);
    
    if (!querySnapshot.empty) {
      console.log(`✅ Admin ${ADMIN_EMAIL} already exists!`);
      process.exit(0);
    }
    
    // Add new admin
    const adminData = {
      email: ADMIN_EMAIL.toLowerCase().trim(),
      name: "Initial Admin",
      addedBy: "System Initialization",
      addedAt: new Date(),
      isInitialAdmin: true  // Mark this admin as the initial admin with special privileges
    };
    
    const docRef = await addDoc(collection(db, "admins"), adminData);
    
    console.log(`✅ Admin ${ADMIN_EMAIL} added successfully with ID: ${docRef.id}`);
    console.log("You can now log in with this email and access the admin dashboard.");
  } catch (error) {
    console.error("❌ Error adding admin:", error);
  }
  
  process.exit(0);
}

// Run the function
addAdmin(); 