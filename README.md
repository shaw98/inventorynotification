# Inventory Notification App

A web application for tracking inventory transfers between locations and generating reports.

## Features

- **Inventory Transfer Management**: Track movement of inventory between locations
- **Admin Dashboard**: View statistics and reports on inventory transfers
- **Export Functionality**: Export data as PDF or Excel/CSV files
- **Admin User Management**: Control who has access to the admin dashboard

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your Firebase configuration in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Admin Setup

To set up the first admin user:

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