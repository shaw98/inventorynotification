// Simple script to set up the initial admin user
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs } = require('firebase/firestore');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Set your admin email here
const ADMIN_EMAIL = 'shaw98@gmail.com'; // Replace with your actual email

async function setupInitialAdmin() {
  try {
    console.log(`Setting up initial admin: ${ADMIN_EMAIL}`);
    
    // Check if admin already exists
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('email', '==', ADMIN_EMAIL));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('Admin already exists!');
      return;
    }
    
    // Add admin to Firestore
    const adminData = {
      email: ADMIN_EMAIL,
      name: 'Initial Admin',
      addedAt: new Date(),
      isInitialAdmin: true
    };
    
    const docRef = await addDoc(adminsRef, adminData);
    console.log(`Admin added with ID: ${docRef.id}`);
    console.log('Initial admin setup complete!');
  } catch (error) {
    console.error('Error setting up admin:', error);
  }
}

setupInitialAdmin(); 