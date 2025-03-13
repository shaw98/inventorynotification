# Firebase Configuration Fixes

This document outlines the changes made to fix Firebase configuration issues that were preventing the dashboard from loading.

## Issues Fixed

1. **Incorrect Storage Bucket URL Format**
   - Changed from: `inventory-notification-2c182.firebasestorage.app`
   - Changed to: `inventory-notification-2c182.appspot.com`
   - The correct format for the storage bucket URL is `your-project-id.appspot.com`

2. **Missing Firebase Database URL**
   - Added: `NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://inventory-notification-2c182.firebaseio.com`
   - This environment variable is required for proper Firebase initialization

3. **Admin Permission Issues**
   - Problem: "Error getting admin by email: FirebaseError: Missing or insufficient permissions"
   - Solution: Used the scripts in the `scripts` folder to properly set up the admin user
   - Temporarily modified Firestore security rules to allow admin setup
   - Added the admin user and set it as the initial admin
   - Restored the original security rules

## How to Apply These Changes

### 1. Update Environment Variables

Make sure your `.env.local` file (or Replit Secrets) includes:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

### 2. Set Up Admin User

Follow the "Method 2" instructions in the README.md file to set up the admin user:

1. Edit `scripts/add-admin.js` and update the `ADMIN_EMAIL` with your email address
2. Run the script to add an admin:
   ```
   node -r dotenv/config scripts/add-admin.js
   ```
3. If needed, update the admin to be the initial admin:
   ```
   node -r dotenv/config scripts/update-initial-admin.js
   ```
4. If you encounter permission errors, temporarily modify Firestore security rules

### 3. Restart the Application

After making these changes, restart your application:

```
npm run dev
```

## Verification

To verify that the changes have been applied correctly:

1. Sign in with the admin email
2. Navigate to the dashboard
3. The dashboard should load without errors
4. You should be able to see the admin dashboard with all its features

If you continue to experience issues, check the browser console for error messages and ensure all environment variables are set correctly. 