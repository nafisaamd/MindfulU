"use client"

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'
import { getStorage, FirebaseStorage } from "firebase/storage"

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Validate Firebase configuration
const validateConfig = () => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ] as const;

  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing required Firebase configuration fields:', missingFields);
    return false;
  }
  
  return true;
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
const auth = getAuth(app)
let storage: FirebaseStorage;

try {
  if (!validateConfig()) {
    throw new Error('Invalid Firebase configuration');
  }

  storage = getStorage(app);

  console.log("Firebase initialized successfully:", {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    auth: !!auth,
    db: !!db,
    currentUser: auth.currentUser ? {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      isAnonymous: auth.currentUser.isAnonymous
    } : null
  });
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error;
}

// Export Firebase instances
export { app, db, auth, storage }

// Safe access functions that check if services are initialized
export const getFirebase = {
  app: () => app,
  auth: () => auth,
  db: () => db,
  storage: () => storage,
}

// Helper function to check if Firebase is fully initialized
export const isFirebaseInitialized = () => {
  return !!app && !!auth && !!db && !!storage;
}

// Helper function to wait for Firebase initialization
export const waitForFirebase = async () => {
  let attempts = 0;
  const maxAttempts = 20;
  const delay = 500;

  while ((!app || !auth || !db || !storage) && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    attempts++;
  }

  if (!app || !auth || !db || !storage) {
    console.error("Firebase services not fully initialized after waiting");
    return null;
  }

  // Additional check to ensure auth is ready
  try {
    await auth.currentUser?.getIdToken(true);
  } catch (error) {
    console.warn("Auth not fully ready:", error);
  }

  return {
    app,
    auth,
    db,
    storage,
  };
}

// Helper function to safely execute Firebase operations
export function withFirebase<T>(
  operation: (firebase: {
    app: FirebaseApp
    auth: Auth
    db: Firestore
    storage: FirebaseStorage
  }) => T | Promise<T>
): T | Promise<T> {
  if (!getApps().length) {
    throw new Error('Firebase is not initialized')
  }

  const app = getApps()[0]
  const auth = getAuth(app)
  const db = getFirestore(app)
  const storage = getStorage(app)

  const result = operation({ app, auth, db, storage })

  if (result instanceof Promise) {
    return result.then((res) => {
      if (res === undefined) {
        console.warn('Firebase operation returned undefined')
      }
      return res
    })
  }

  return result
}
