import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Lazy initialization: Services only initialize when first used
// This prevents QUIC_TOO_MANY_RTOS errors at app startup
let _db: ReturnType<typeof getFirestore> | null = null
let _auth: ReturnType<typeof getAuth> | null = null
let _storage: ReturnType<typeof getStorage> | null = null

/**
 * Get Firestore instance - initializes on first use
 * @returns Firestore instance
 */
export function getDb() {
  if (!_db) {
    _db = getFirestore(app)
  }
  return _db
}

/**
 * Get Auth instance - initializes on first use
 * @returns Auth instance
 */
export function getAuthInstance() {
  if (!_auth) {
    _auth = getAuth(app)
  }
  return _auth
}

/**
 * Get Storage instance - initializes on first use
 * @returns Storage instance
 */
export function getStorageInstance() {
  if (!_storage) {
    _storage = getStorage(app)
  }
  return _storage
}
