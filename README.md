# Inventory Notification System

A web application for managing inventory transfers between locations and sending notifications.

## Features

- User authentication with Firebase
- Input form for inventory transfers
- Email notifications to location managers
- Admin dashboard for viewing transfer history

## Important Firebase Configuration Updates

When setting up this project, ensure your Firebase configuration is correct:

1. **Storage Bucket Format**: 
   - Use `your-project-id.appspot.com` format for `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - NOT `your-project-id.firebasestorage.app`

2. **Required Environment Variables**:
   - All Firebase environment variables listed below are required
   - Make sure to include `NEXT_PUBLIC_FIREBASE_DATABASE_URL` (https://your-project-id.firebaseio.com)

3. **Admin Setup**:
   - Follow the Admin Setup instructions below
   - If you encounter permission errors, you may need to temporarily modify Firestore security rules
   - Use the scripts in the `scripts` folder to add the initial admin

## Deploying to Replit

This project is configured to be deployed on Replit. Follow these steps to deploy:

1. **Fork the Repository to Replit**
   - Go to [Replit](https://replit.com/)
   - Click on "Create Repl"
   - Choose "Import from GitHub"
   - Paste your repository URL
   - Select "Next.js" as the language

2. **Configure Environment Variables**
   - In your Replit project, go to the "Secrets" tab (lock icon in the sidebar)
   - Add all the necessary environment variables from your `.env.local` file
   - Make sure to include:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (use appspot.com format)
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
     - Any other API keys your application uses (OpenAI, Anthropic, Replicate, etc.)

3. **Run the Application**
   - Replit will automatically run `npm run dev` for development
   - For production, it will run `npm run build && npm run start`

4. **Access Your Deployed Application**
   - Once deployed, Replit will provide you with a URL to access your application
   - You can find this URL in the "Webview" tab

5. **Troubleshooting**
   - If you encounter any issues, check the Replit console for error messages
   - Make sure all environment variables are correctly set
   - Verify that your `.replit` and `replit.nix` files are properly configured

## Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file with the environment variables listed above
4. Run the development server with `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Security Notes

- The application uses server-side API routes to handle database operations
- Firebase configuration is stored in environment variables
- Authentication is required for sensitive operations
- Email notifications are sent through a secure Gmail connection

## Admin Setup

To set up the first admin user:

### Method 1: Using the initialization script

1. Edit `src/lib/scripts/initializeAdmin.ts` and update the `INITIAL_ADMIN_EMAIL` with your email address
2. Install the required dependencies if you haven't already:
   ```
   npm install --save-dev ts-node tsconfig-paths
   ```
3. Run the initialization script:
   ```
   npx ts-node -r tsconfig-paths/register src/lib/scripts/initializeAdmin.ts
   ```
4. Sign in with the email you specified to access the admin dashboard

### Method 2: Using the scripts in the scripts folder

If you encounter permission issues with Method 1, you can use these scripts:

1. Edit `scripts/add-admin.js` and update the `ADMIN_EMAIL` with your email address
2. Run the script to add an admin:
   ```
   node -r dotenv/config scripts/add-admin.js
   ```
3. If needed, update the admin to be the initial admin:
   ```
   node -r dotenv/config scripts/update-initial-admin.js
   ```
4. If you encounter permission errors, you may need to temporarily modify Firestore security rules:
   - Edit `firestore.rules` and change the admins collection rules to:
     ```
     match /admins/{adminId} {
       allow read, write: if true;
     }
     ```
   - Deploy the updated rules:
     ```
     firebase deploy --only firestore:rules
     ```
   - Run the admin scripts
   - Restore the original security rules and deploy again

5. Sign in with the email you specified to access the admin dashboard

## Admin Dashboard

The admin dashboard provides:

- Overview statistics of transfers, drivers, and locations
- Filtering options for transfers (by date range or driver)
- Data visualization with charts
- Export functionality (PDF and Excel/CSV)
- Admin user management

### Managing Admin Users

1. Access the admin dashboard
2. Click on "Manage Admins" button
3. Add new admin users by providing their email address
4. Remove admin users as needed

### Exporting Data

1. Apply filters as needed to the data
2. Click "Export PDF" or "Export Excel" buttons
3. The file will be downloaded to your device

## Technologies Used

- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- Firebase (Authentication, Firestore)
- Chart.js
- jsPDF and xlsx for exports