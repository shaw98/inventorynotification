import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Auth functions
export const logoutUser = () => {
  if (!auth) {
    console.error("Firebase auth is not initialized");
    return Promise.reject("Firebase auth is not initialized");
  }
  return signOut(auth);
};

export const signInWithGoogle = async () => {
  if (!auth) {
    console.error("Firebase auth is not initialized");
    throw new Error("Firebase auth is not initialized");
  }
  
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) {
    console.error("Firebase auth is not initialized");
    throw new Error("Firebase auth is not initialized");
  }
  
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email and password", error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  if (!auth) {
    console.error("Firebase auth is not initialized");
    throw new Error("Firebase auth is not initialized");
  }
  
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing up with email and password", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  if (!auth) {
    console.error("Firebase auth is not initialized");
    throw new Error("Firebase auth is not initialized");
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw error;
  }
};

// Firestore functions
export const addDocument = async (collectionName: string, data: any) => {
  if (!db) {
    console.error("Firebase Firestore is not initialized");
    throw new Error("Firebase Firestore is not initialized");
  }
  return addDoc(collection(db, collectionName), data);
};

export const getDocuments = async (collectionName: string) => {
  if (!db) {
    console.error("Firebase Firestore is not initialized");
    throw new Error("Firebase Firestore is not initialized");
  }
  
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  if (!db) {
    console.error("Firebase Firestore is not initialized");
    throw new Error("Firebase Firestore is not initialized");
  }
  return updateDoc(doc(db, collectionName, id), data);
};

export const deleteDocument = async (collectionName: string, id: string) => {
  if (!db) {
    console.error("Firebase Firestore is not initialized");
    throw new Error("Firebase Firestore is not initialized");
  }
  return deleteDoc(doc(db, collectionName, id));
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  if (!storage) {
    console.error("Firebase Storage is not initialized");
    throw new Error("Firebase Storage is not initialized");
  }
  
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
