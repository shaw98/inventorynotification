import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  startAfter,
  getDoc,
  doc,
  Firestore,
  deleteDoc,
} from "firebase/firestore";

// Type definitions for transfer data
export interface Transfer {
  id?: string;
  fromLocation: string;
  toLocation: string;
  stockNumber: string;
  brand: string;
  model: string;
  driverName: string;
  transferDate: string;
  timestamp: Timestamp;
  userId: string;
}

// Collection name
const TRANSFERS_COLLECTION = "transfers";

// Predefined list of drivers
export const DRIVERS = [
  "Bobby", 
  "John", 
  "Austin", 
  "Robert"
];

// Predefined list of locations
export const LOCATIONS = ["Lakewood", "Longmont", "Fountain", "Airstream", "Storage"];

// Check if Firebase is initialized
const isFirebaseInitialized = (): boolean => {
  if (!db) {
    console.error("Firestore is not initialized. Check your Firebase configuration.");
    return false;
  }
  return true;
};

// Add a new transfer to the database
export const addTransfer = async (transferData: Omit<Transfer, "id" | "timestamp">) => {
  try {
    if (!isFirebaseInitialized()) {
      throw new Error("Firebase database is not available. Please check your configuration.");
    }
    
    const docRef = await addDoc(collection(db as Firestore, TRANSFERS_COLLECTION), {
      ...transferData,
      timestamp: Timestamp.now(),
    });
    return { id: docRef.id, ...transferData };
  } catch (error) {
    console.error("Error adding transfer:", error);
    throw error;
  }
};

// Get all transfers
export const getAllTransfers = async () => {
  try {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    const querySnapshot = await getDocs(
      query(collection(db as Firestore, TRANSFERS_COLLECTION), orderBy("timestamp", "desc"))
    );
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transfer[];
  } catch (error) {
    console.error("Error getting transfers:", error);
    return [];
  }
};

// Get transfers with pagination
export const getTransfersPaginated = async (
  lastDoc: QueryDocumentSnapshot<DocumentData> | null,
  pageSize: number = 10
) => {
  try {
    if (!isFirebaseInitialized()) {
      return { transfers: [], lastVisible: null, hasMore: false };
    }
    
    let transfersQuery;
    
    if (lastDoc) {
      transfersQuery = query(
        collection(db as Firestore, TRANSFERS_COLLECTION),
        orderBy("timestamp", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );
    } else {
      transfersQuery = query(
        collection(db as Firestore, TRANSFERS_COLLECTION),
        orderBy("timestamp", "desc"),
        limit(pageSize)
      );
    }
    
    const querySnapshot = await getDocs(transfersQuery);
    
    const transfers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transfer[];
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return {
      transfers,
      lastVisible,
      hasMore: querySnapshot.docs.length === pageSize,
    };
  } catch (error) {
    console.error("Error getting paginated transfers:", error);
    return { transfers: [], lastVisible: null, hasMore: false };
  }
};

// Get transfers by date range
export const getTransfersByDateRange = async (startDate: Date, endDate: Date) => {
  try {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    
    const querySnapshot = await getDocs(
      query(
        collection(db as Firestore, TRANSFERS_COLLECTION),
        where("timestamp", ">=", startTimestamp),
        where("timestamp", "<=", endTimestamp),
        orderBy("timestamp", "desc")
      )
    );
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transfer[];
  } catch (error) {
    console.error("Error getting transfers by date range:", error);
    return [];
  }
};

// Get transfers by driver
export const getTransfersByDriver = async (driverName: string) => {
  try {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    const querySnapshot = await getDocs(
      query(
        collection(db as Firestore, TRANSFERS_COLLECTION),
        where("driverName", "==", driverName),
        orderBy("timestamp", "desc")
      )
    );
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transfer[];
  } catch (error) {
    console.error("Error getting transfers by driver:", error);
    return [];
  }
};

// Get transfer statistics
export const getTransferStats = async () => {
  try {
    if (!isFirebaseInitialized()) {
      return {
        totalTransfers: 0,
        driverCounts: {},
        fromLocationCounts: {},
        toLocationCounts: {},
      };
    }
    
    const querySnapshot = await getDocs(collection(db as Firestore, TRANSFERS_COLLECTION));
    const transfers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transfer[];
    
    // Count transfers by driver
    const driverCounts: Record<string, number> = {};
    transfers.forEach((transfer) => {
      driverCounts[transfer.driverName] = (driverCounts[transfer.driverName] || 0) + 1;
    });
    
    // Count transfers by location
    const fromLocationCounts: Record<string, number> = {};
    const toLocationCounts: Record<string, number> = {};
    
    transfers.forEach((transfer) => {
      fromLocationCounts[transfer.fromLocation] = (fromLocationCounts[transfer.fromLocation] || 0) + 1;
      toLocationCounts[transfer.toLocation] = (toLocationCounts[transfer.toLocation] || 0) + 1;
    });
    
    return {
      totalTransfers: transfers.length,
      driverCounts,
      fromLocationCounts,
      toLocationCounts,
    };
  } catch (error) {
    console.error("Error getting transfer stats:", error);
    return {
      totalTransfers: 0,
      driverCounts: {},
      fromLocationCounts: {},
      toLocationCounts: {},
    };
  }
};

/**
 * Get transfers by location
 */
export const getTransfersByLocation = async (location: string, isFromLocation: boolean = true): Promise<Transfer[]> => {
  try {
    if (!isFirebaseInitialized()) {
      return [];
    }
    
    const fieldName = isFromLocation ? "fromLocation" : "toLocation";
    
    const querySnapshot = await getDocs(
      query(
        collection(db as Firestore, TRANSFERS_COLLECTION),
        where(fieldName, "==", location),
        orderBy("timestamp", "desc")
      )
    );
    
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Transfer[];
  } catch (error) {
    console.error(`Error getting transfers by ${isFromLocation ? "from" : "to"} location:`, error);
    return [];
  }
};

// Debug function to create a test transfer
export const createTestTransfer = async (userId: string) => {
  try {
    if (!isFirebaseInitialized()) {
      console.log("Firebase not initialized");
      return null;
    }
    
    // Use a random driver from the predefined list
    const randomDriverIndex = Math.floor(Math.random() * DRIVERS.length);
    
    const testTransfer = {
      fromLocation: LOCATIONS[0],
      toLocation: LOCATIONS[1],
      stockNumber: "TEST-" + Math.floor(Math.random() * 10000),
      brand: "Test Brand",
      model: "Test Model",
      driverName: DRIVERS[randomDriverIndex],
      transferDate: new Date().toISOString().split('T')[0],
      timestamp: Timestamp.now(),
      userId: userId
    };
    
    const docRef = await addDoc(collection(db as Firestore, TRANSFERS_COLLECTION), testTransfer);
    console.log("Created test transfer with ID:", docRef.id);
    
    return { id: docRef.id, ...testTransfer };
  } catch (error) {
    console.error("Error creating test transfer:", error);
    return null;
  }
};

// Function to generate multiple test transfers
export const generateTestTransfers = async (userId: string, count: number = 10): Promise<number> => {
  try {
    if (!isFirebaseInitialized()) {
      console.log("Firebase not initialized");
      return 0;
    }
    
    console.log(`Generating ${count} test transfers...`);
    
    const brands = ["Airstream", "Winnebago", "Jayco", "Thor", "Forest River"];
    const models = ["Classic", "Minnie", "Eagle", "Magnitude", "Sunseeker"];
    
    const batch = [];
    
    for (let i = 0; i < count; i++) {
      // Generate random data
      const fromIndex = Math.floor(Math.random() * LOCATIONS.length);
      let toIndex = Math.floor(Math.random() * LOCATIONS.length);
      
      // Make sure from and to locations are different
      while (toIndex === fromIndex) {
        toIndex = Math.floor(Math.random() * LOCATIONS.length);
      }
      
      const driverIndex = Math.floor(Math.random() * DRIVERS.length);
      const brandIndex = Math.floor(Math.random() * brands.length);
      const modelIndex = Math.floor(Math.random() * models.length);
      
      // Create random date within the last 30 days
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      const testTransfer = {
        fromLocation: LOCATIONS[fromIndex],
        toLocation: LOCATIONS[toIndex],
        stockNumber: "TEST-" + Math.floor(Math.random() * 10000),
        brand: brands[brandIndex],
        model: models[modelIndex],
        driverName: DRIVERS[driverIndex],
        transferDate: date.toISOString().split('T')[0],
        timestamp: Timestamp.fromDate(date),
        userId: userId
      };
      
      batch.push(addDoc(collection(db as Firestore, TRANSFERS_COLLECTION), testTransfer));
    }
    
    const results = await Promise.all(batch);
    console.log(`Successfully created ${results.length} test transfers`);
    
    return results.length;
  } catch (error) {
    console.error("Error generating test transfers:", error);
    return 0;
  }
}; 