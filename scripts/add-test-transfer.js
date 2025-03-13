/**
 * Simple script to add a test transfer to Firebase
 * 
 * Usage:
 * 1. Make sure your .env.local file has your Firebase configuration
 * 2. Run: node -r dotenv/config scripts/add-test-transfer.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc,
  Timestamp
} = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestTransfer() {
  console.log("Adding test transfer...");
  
  try {
    // Create a test transfer
    const testTransfer = {
      fromLocation: "Lakewood",
      toLocation: "Fountain",
      stockNumber: "TEST-" + Math.floor(Math.random() * 10000),
      brand: "Test Brand",
      model: "Test Model",
      driverName: "Test Driver",
      transferDate: new Date().toISOString().split('T')[0],
      timestamp: Timestamp.now(),
      userId: "test-user-id"
    };
    
    // Add the transfer to Firestore
    const docRef = await addDoc(collection(db, "transfers"), testTransfer);
    
    console.log(`✅ Test transfer added with ID: ${docRef.id}`);
    console.log("Transfer data:", testTransfer);
  } catch (error) {
    console.error("❌ Error adding test transfer:", error);
  }
  
  process.exit(0);
}

// Run the function
addTestTransfer(); 