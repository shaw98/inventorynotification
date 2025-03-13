import { NextResponse } from "next/server";
import { checkFirebaseConfig, isFirebaseConfigValid } from "@/lib/firebase/firebaseConfig";

export async function GET() {
  try {
    const isConfigured = checkFirebaseConfig();
    const isValid = isFirebaseConfigValid();
    
    // Only return minimal information to avoid exposing sensitive data
    return NextResponse.json({
      firebase: {
        configured: isConfigured,
        valid: isValid,
      },
      email: {
        configured: !!process.env.GMAIL_EMAIL && !!process.env.GMAIL_APP_PASSWORD,
      }
    });
  } catch (error) {
    console.error("Error checking environment:", error);
    return NextResponse.json(
      { error: "Failed to check environment" },
      { status: 500 }
    );
  }
} 