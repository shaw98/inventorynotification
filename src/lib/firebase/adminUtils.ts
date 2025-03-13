import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  setDoc,
} from "firebase/firestore";

// Collection name
const ADMINS_COLLECTION = "admins";

// Admin user interface
export interface AdminUser {
  id?: string;
  email: string;
  name?: string;
  addedBy?: string;
  addedAt: Date;
  isInitialAdmin?: boolean;
}

// Check if Firebase is initialized
const isFirebaseInitialized = (): boolean => {
  if (!db) {
    console.error("Firestore is not initialized. Check your Firebase configuration.");
    return false;
  }
  return true;
};

/**
 * Add a new admin user
 */
export const addAdminUser = async (email: string, name: string = "", addedBy: string = "", isInitialAdmin: boolean = false): Promise<AdminUser | null> => {
  try {
    if (!isFirebaseInitialized()) {
      throw new Error("Firebase database is not available. Please check your configuration.");
    }
    
    // Check if admin already exists
    const existingAdmin = await getAdminByEmail(email);
    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists.`);
      return existingAdmin;
    }
    
    const adminData: Omit<AdminUser, "id"> = {
      email: email.toLowerCase().trim(),
      name,
      addedBy,
      addedAt: new Date(),
      isInitialAdmin
    };
    
    const docRef = await addDoc(collection(db as Firestore, ADMINS_COLLECTION), adminData);
    return { id: docRef.id, ...adminData };
  } catch (error) {
    console.error("Error adding admin user:", error);
    return null;
  }
};

/**
 * Get all admin users
 */
export const getAllAdmins = async (): Promise<AdminUser[]> => {
  try {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    const querySnapshot = await getDocs(collection(db as Firestore, ADMINS_COLLECTION));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate() || new Date(),
    })) as AdminUser[];
  } catch (error) {
    console.error("Error getting admin users:", error);
    return [];
  }
};

/**
 * Get admin by email
 */
export const getAdminByEmail = async (email: string): Promise<AdminUser | null> => {
  try {
    if (!isFirebaseInitialized()) {
      return null;
    }
    
    const q = query(
      collection(db as Firestore, ADMINS_COLLECTION),
      where("email", "==", email.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate() || new Date(),
    } as AdminUser;
  } catch (error) {
    console.error("Error getting admin by email:", error);
    return null;
  }
};

/**
 * Check if a user is an admin
 */
export const isUserAdmin = async (email: string): Promise<boolean> => {
  try {
    if (!email || !isFirebaseInitialized()) {
      return false;
    }
    
    const admin = await getAdminByEmail(email.toLowerCase().trim());
    return admin !== null;
  } catch (error) {
    console.error("Error checking if user is admin:", error);
    return false;
  }
};

/**
 * Check if a user is the initial admin
 */
export const isUserInitialAdmin = async (email: string): Promise<boolean> => {
  try {
    if (!email || !isFirebaseInitialized()) {
      return false;
    }
    
    const admin = await getAdminByEmail(email.toLowerCase().trim());
    return admin !== null && admin.isInitialAdmin === true;
  } catch (error) {
    console.error("Error checking if user is initial admin:", error);
    return false;
  }
};

/**
 * Remove an admin user
 */
export const removeAdminUser = async (id: string): Promise<boolean> => {
  try {
    if (!isFirebaseInitialized()) {
      return false;
    }
    
    await deleteDoc(doc(db as Firestore, ADMINS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error("Error removing admin user:", error);
    return false;
  }
}; 