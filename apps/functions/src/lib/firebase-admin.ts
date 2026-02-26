/**
 * Firebase Admin SDK Initialization
 * Handles authentication and database connection for server-side operations
 *
 * Authentication Methods:
 * 1. Development: GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
 * 2. Production: Workload Identity Federation (WIF) via GCLOUD_PROJECT
 */

import admin from 'firebase-admin'

let db: admin.firestore.Firestore | null = null
let isInitialized = false

/**
 * Initialize Firebase Admin SDK
 * Uses Application Default Credentials (ADC) which checks:
 * 1. GOOGLE_APPLICATION_CREDENTIALS environment variable
 * 2. User's gcloud credentials
 * 3. GCP metadata service (for Cloud Run, Cloud Functions, etc.)
 * 4. Firestore Emulator (if FIRESTORE_EMULATOR_HOST is set)
 */
function initializeFirebaseAdmin(): void {
  if (isInitialized) {
    return
  }

  try {
    // Check if already initialized (for cases where app.initializeApp() was called elsewhere)
    if (admin.apps.length > 0) {
      db = admin.firestore()
      isInitialized = true
      console.log('[Firebase Admin] Using existing Firebase app instance')
      return
    }

    // Initialize Firebase Admin with Application Default Credentials
    // For local development with issues, set FIRESTORE_EMULATOR_HOST=localhost:8080
    admin.initializeApp({
      projectId: 'maneho-ai',
      // credentials are automatically loaded from GOOGLE_APPLICATION_CREDENTIALS
      // or from the environment if running on GCP
      // or from Workload Identity Federation in Cloud Run
    })

    db = admin.firestore()

    // Enable ignoreUndefinedProperties to allow undefined fields in documents
    // This prevents errors when storing documents with optional fields
    db.settings({ ignoreUndefinedProperties: true })

    isInitialized = true

    console.log(`[Firebase Admin] ✓ Initialized for project: maneho-ai`)

    // Check if using emulator
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.log(
        `[Firebase Admin] ✓ Using Firestore Emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`
      )
    } else {
      console.log('[Firebase Admin] ✓ Using Cloud Firestore (production)')
    }
  } catch (error) {
    console.error('[Firebase Admin] ✗ Initialization failed:', error)
    console.error('[Firebase Admin] ℹ️  For local development, use Firestore Emulator:')
    console.error('      firebase init emulators')
    console.error('      firebase emulators:start')
    console.error('      Then set: FIRESTORE_EMULATOR_HOST=localhost:8080')
    throw error
  }
}

/**
 * Get Firestore database instance
 * Initializes on first call, returns cached instance thereafter
 */
export function getFirestore(): admin.firestore.Firestore {
  if (!db) {
    initializeFirebaseAdmin()
  }

  if (!db) {
    throw new Error('Firebase Admin SDK failed to initialize')
  }

  return db
}

/**
 * Check if Firebase is initialized
 */
export function isFirebaseInitialized(): boolean {
  return isInitialized && db !== null
}

/**
 * Get the Firebase Admin app instance
 */
export function getAdminApp(): admin.app.App {
  const apps = admin.apps
  if (apps.length === 0) {
    initializeFirebaseAdmin()
  }

  const app = admin.app()
  if (!app) {
    throw new Error('Firebase Admin app not initialized')
  }

  return app
}

export default { getFirestore, isFirebaseInitialized, getAdminApp }
