import { NextResponse } from "next/server";
import { addTransfer as addTransferToFirebase } from "@/lib/firebase/transferUtils";

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json();
    const { fromLocation, toLocation, stockNumber, brand, model, driverName, transferDate, userId } = data;
    
    // Validate required fields
    if (!fromLocation || !toLocation || !stockNumber || !brand || !model || !driverName || !transferDate || !userId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    
    // Add transfer to Firebase
    try {
      await addTransferToFirebase({
        fromLocation,
        toLocation,
        stockNumber,
        brand,
        model,
        driverName,
        transferDate,
        userId,
      });
      
      return NextResponse.json({ success: true });
    } catch (firebaseError) {
      console.error("Firebase error:", firebaseError);
      return NextResponse.json(
        { error: "Failed to save transfer data to database" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing transfer:", error);
    return NextResponse.json(
      { error: "Failed to process transfer" },
      { status: 500 }
    );
  }
} 