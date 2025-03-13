/**
 * This script initializes the first admin user in the database.
 * Run this script once to set up the initial admin.
 * 
 * Usage:
 * 1. Update the INITIAL_ADMIN_EMAIL below with your email
 * 2. Run with: npx ts-node src/lib/scripts/initializeAdmin.ts
 */

// Import using relative path
import { addAdminUser } from "../firebase/adminUtils";

// Set your email here
const INITIAL_ADMIN_EMAIL = "shaw98@gmail.com";

async function initializeAdmin() {
  console.log(`Initializing admin user: ${INITIAL_ADMIN_EMAIL}`);
  
  try {
    const result = await addAdminUser(
      INITIAL_ADMIN_EMAIL,
      "Initial Admin",
      "System Initialization"
    );
    
    if (result) {
      console.log("✅ Admin user initialized successfully!");
      console.log("You can now log in with this email and access the admin dashboard.");
    } else {
      console.error("❌ Failed to initialize admin user.");
    }
  } catch (error) {
    console.error("❌ Error initializing admin user:", error);
  }
  
  // Exit the process
  process.exit(0);
}

// Run the initialization
initializeAdmin(); 