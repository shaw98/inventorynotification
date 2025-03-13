/**
 * Script to update an existing admin to be the initial admin
 * 
 * Usage:
 * node scripts/update-initial-admin.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  doc
} = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Your email to set as initial admin
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

async function updateInitialAdmin() {
  console.log(`Updating admin ${ADMIN_EMAIL} to be the initial admin...`);
  
  try {
    // Find the admin by email
    const adminQuery = query(
      collection(db, "admins"),
      where("email", "==", ADMIN_EMAIL.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(adminQuery);
    
    if (querySnapshot.empty) {
      console.error(`❌ Admin with email ${ADMIN_EMAIL} not found.`);
      process.exit(1);
    }
    
    // Get the admin document
    const adminDoc = querySnapshot.docs[0];
    
    // Update the admin to be the initial admin
    await updateDoc(doc(db, "admins", adminDoc.id), {
      isInitialAdmin: true
    });
    
    console.log(`✅ Admin ${ADMIN_EMAIL} has been updated to be the initial admin.`);
    console.log("This admin now has exclusive rights to manage other admins.");
  } catch (error) {
    console.error("❌ Error updating admin:", error);
  }
  
  process.exit(0);
}

// Run the function
updateInitialAdmin(); 