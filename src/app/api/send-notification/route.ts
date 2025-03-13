import { NextResponse } from "next/server";
import nodemailer from 'nodemailer';

// Email configuration
// In a production environment, you would use environment variables for these values
const EMAIL_CONFIG = {
  // Default sender email (can be overridden)
  fromEmail: process.env.GMAIL_EMAIL || "inventorywrv@gmail.com",
  
  // Location manager emails
  locationEmails: {
    "Lakewood": "shaw98@gmail.com",
    "Longmont": "shaw98@gmail.com",
    "Fountain": "shaw98@gmail.com",
    "Airstream": "shaw98@gmail.com",
    "Storage": "shaw98@gmail.com",
  },

  // System name to use in email signatures
  systemName: "Inventory Notification System"
};

// Create a nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    // For Gmail, you need to use an "App Password" if you have 2FA enabled
    // Create one at https://myaccount.google.com/apppasswords
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Email sending function using nodemailer
async function sendEmail(to: string, subject: string, body: string, from: string) {
  try {
    const mailOptions = {
      from,
      to,
      subject,
      text: body,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Format the email body based on the transfer type
function formatEmailBody(data: any, emailType: 'fromLocation' | 'toLocation' | 'toStorage' | 'fromStorage') {
  const { fromLocation, toLocation, stockNumber, brand, model, driverName, transferDate, userEmail } = data;
  
  // Format the date - use transferDate if available, otherwise use current date
  const formattedDate = transferDate || new Date().toLocaleDateString();
  const systemName = EMAIL_CONFIG.systemName;

  switch (emailType) {
    case 'fromLocation':
      return `Dear ${fromLocation} Team,

This email confirms the following unit is being transferred from your location:

Stock Number: ${stockNumber}
Make: ${brand}
Model: ${model}
Transfer Date: ${formattedDate}
Destination: ${toLocation}
Driver: ${driverName}

Best regards,
${systemName}`;

    case 'toLocation':
      return `Dear ${toLocation} Team,

A new unit is being transferred to your location:

Stock Number: ${stockNumber}
Make: ${brand}
Model: ${model}
Transfer Date: ${formattedDate}
Origin: ${fromLocation}
Driver: ${driverName}

Required Actions:
- Update unit location in Interact
- Update Systems inventory
- Take new exterior photos for website

Please complete these tasks within 24 hours of receiving the unit.

Best regards,
${systemName}`;

    case 'toStorage':
      return `Dear ${fromLocation} and ${toLocation} Managers,

This notification confirms a unit is being transferred to storage:

Stock Number: ${stockNumber}
Make: ${brand}
Model: ${model}
Transfer Date: ${formattedDate}
Storage Location: ${toLocation}
Origin Location: ${fromLocation}
Driver: ${driverName}

Please update your respective systems accordingly.

Best regards,
${systemName}`;

    case 'fromStorage':
      return `Dear ${toLocation} Team and ${fromLocation} Team,

This notification confirms a unit is being transferred from storage to ${toLocation}:

Stock Number: ${stockNumber}
Make: ${brand}
Model: ${model}
Transfer Date: ${formattedDate}
Origin: ${fromLocation}
Destination: ${toLocation}
Driver: ${driverName}

Please update your respective systems accordingly.

Best regards,
${systemName}`;

    default:
      return '';
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    const { fromLocation, toLocation, stockNumber } = data;
    
    // Validate required fields
    if (!fromLocation || !toLocation) {
      return NextResponse.json(
        { error: "From location and To location are required" },
        { status: 400 }
      );
    }
    
    // Get the manager emails for the from and to locations
    const fromLocationEmail = EMAIL_CONFIG.locationEmails[fromLocation as keyof typeof EMAIL_CONFIG.locationEmails];
    const toLocationEmail = EMAIL_CONFIG.locationEmails[toLocation as keyof typeof EMAIL_CONFIG.locationEmails];
    
    if (!fromLocationEmail || !toLocationEmail) {
      return NextResponse.json(
        { error: "Invalid location specified" },
        { status: 400 }
      );
    }

    // Determine the type of transfer
    const isToStorage = toLocation === "Storage";
    const isFromStorage = fromLocation === "Storage";
    
    if (isToStorage) {
      // Send storage transfer notification to both locations
      await sendEmail(
        `${fromLocationEmail}, ${toLocationEmail}`,
        `Unit Moving to Storage - ${stockNumber}`,
        formatEmailBody(data, 'toStorage'),
        EMAIL_CONFIG.fromEmail
      );
    } else if (isFromStorage) {
      // Send from storage transfer notification to both locations
      await sendEmail(
        `${fromLocationEmail}, ${toLocationEmail}`,
        `Unit Transfer from Storage - ${stockNumber}`,
        formatEmailBody(data, 'fromStorage'),
        EMAIL_CONFIG.fromEmail
      );
    } else {
      // Standard transfer - send separate emails to from and to locations
      await sendEmail(
        fromLocationEmail,
        `Inventory Transfer Notification - ${stockNumber}`,
        formatEmailBody(data, 'fromLocation'),
        EMAIL_CONFIG.fromEmail
      );
      
      await sendEmail(
        toLocationEmail,
        `Incoming Inventory Transfer - ${stockNumber}`,
        formatEmailBody(data, 'toLocation'),
        EMAIL_CONFIG.fromEmail
      );
    }
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
} 