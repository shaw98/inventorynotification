# Inventory Notification App

A web application for tracking inventory movement between locations. Drivers can sign in, submit inventory transfer information, and the system automatically notifies location managers via email.

## Features

- Google Authentication for secure sign-in
- Form for drivers to input inventory transfer details:
  - From Location (dropdown)
  - To Location (dropdown)
  - Stock Number
  - Brand
  - Model
  - Driver Name (dropdown or custom input)
- Email notifications sent to managers at both the origin and destination locations
- Confirmation page with success animation
- Mobile-responsive design

## Technical Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript, Tailwind CSS
- **Authentication**: Firebase Authentication (Google Sign-In)
- **Animation**: Framer Motion
- **Email**: Nodemailer with Gmail

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Google Authentication
   - Create a web app and get your Firebase config
   - Create a `.env.local` file with your Firebase credentials:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     ```

4. Configure Gmail for sending emails:
   - Add your Gmail credentials to the `.env.local` file:
     ```
     GMAIL_EMAIL=your-gmail@gmail.com
     GMAIL_APP_PASSWORD=your-app-password
     ```
   - For the `GMAIL_APP_PASSWORD`, you need to create an App Password:
     1. Go to your Google Account settings: [https://myaccount.google.com/](https://myaccount.google.com/)
     2. Navigate to Security > 2-Step Verification
     3. At the bottom, select "App passwords"
     4. Create a new app password for "Mail" and "Other (Custom name)" - name it "Inventory Notification"
     5. Copy the generated 16-character password and use it as your `GMAIL_APP_PASSWORD`
   - Update the location manager emails in `src/app/api/send-notification/route.ts` with actual email addresses

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Customization

- **Location List**: Update the `LOCATIONS` array in `src/app/input/page.tsx`
- **Driver List**: Update the `driverList` state in `src/app/input/page.tsx`
- **Email Templates**: Modify the email templates in `src/app/api/send-notification/route.ts`

## Deployment

This application can be deployed to Vercel with minimal configuration:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

## License

MIT