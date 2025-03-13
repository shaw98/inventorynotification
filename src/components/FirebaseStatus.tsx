"use client";

import { useEffect, useState } from "react";

export default function FirebaseStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        // Use the API endpoint to check the environment
        const response = await fetch('/api/check-env');
        
        if (!response.ok) {
          throw new Error("Failed to check database connection");
        }
        
        const data = await response.json();
        
        if (!data.firebase.configured || !data.firebase.valid) {
          throw new Error("Firebase is not properly configured");
        }
        
        setStatus("connected");
      } catch (error) {
        console.error("Firebase connection error:", error);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      }
    };

    checkFirebaseConnection();
  }, []);

  if (status === "checking") {
    return (
      <div className="text-sm text-gray-500 mt-2">
        Checking database connection...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-sm text-red-500 mt-2">
        Database connection error: {errorMessage}. Your data may not be saved.
      </div>
    );
  }

  // Return null (no visible component) when connected
  return null;
} 