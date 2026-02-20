import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// In Vite, we use import.meta.env instead of process.env to access variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
// We check if it's already initialized to prevent errors during Vite's hot module replacement (HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firestore and export it so we can use it in our components
export const db = getFirestore(app)
