# Phase 2: Database & Storage Configuration - Status Report

## Date: 2025-02-21

## Status: IN PROGRESS

---

## Completed Tasks ✅

### 2.3 Define Shared Zod Schemas

- ✅ **AskLawyerSchema**: String query for legal questions
  - `query`: min 1, max 2000 characters
- ✅ **TicketDecoderSchema**: Firebase Storage image URL
  - `imageUrl`: validated URL
- ✅ **CostEstimatorSchema**: Vehicle details for renewal costs
  - `vehicleType`: motorcycle | car | truck | bus | special
  - `modelYear`: year between 1990 and current year
  - `monthsLate`: 0-60 months
- ✅ **ExamQuizSchema**: Quiz category selection
  - `category`: non-professional | professional | student | renewal | special-rights
- ✅ **IngestDocumentSchema**: PDF document upload metadata
  - `storageUri`: Cloud Storage URL
  - `documentType`: memorandum | jao | ra4136 | fee-table | regulation
  - `tags`: optional year, date, jurisdiction metadata

**Files Created:**

- `packages/shared/src/schemas/ask-lawyer.ts`
- `packages/shared/src/schemas/ticket-decoder.ts`
- `packages/shared/src/schemas/cost-estimator.ts`
- `packages/shared/src/schemas/exam-quiz.ts`
- `packages/shared/src/schemas/ingest-document.ts`
- Updated: `packages/shared/src/schemas/index.ts`

✅ TypeScript compilation verified - all schemas compile without errors

---

## Manual Steps Required (GCP/Firebase Console)

### 2.1 Initialize Firestore

```
1. Go to Firebase Console → maneho-ai project
2. Navigate to: Firestore Database → Create Database
3. Choose region (recommended: nearest to your users)
4. Start in Test Mode (for initial setup - remember to configure production rules later)
5. Collections to create:
   - users/
   - documents/ (for document metadata)
   - quizzes/ (for quiz questions)
```

### 2.2 Initialize Firebase Storage

```
1. Go to Firebase Console → Storage
2. Enable Firebase Storage
3. Choose default location (same region as Firestore recommended)
4. Create folder: lto-documents/
   - This will store raw PDFs (LTO memorandums, JAO, RA 4136)
```

### 2.3 Firestore Security Rules

```
1. Go to Firebase Console → Firestore → Rules
2. Apply these rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - read own data, admins can write
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId || hasRole('admin');
    }

    // Public documents - everyone can read, admins can write
    match /documents/{document=**} {
      allow read: if true;
      allow write: if hasRole('admin');
    }

    // Quizzes - everyone can read, admins can write
    match /quizzes/{quiz=**} {
      allow read: if true;
      allow write: if hasRole('admin');
    }

    // Helper function
    function hasRole(role) {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid))
             .data.role == role;
    }
  }
}
```

### 2.4 Firebase Storage Security Rules

```
1. Go to Firebase Console → Storage → Rules
2. Apply these rules:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // LTO documents - everyone can read PDFs, admins can upload
    match /lto-documents/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
                      hasRole(request.auth.uid, 'admin');
    }

    // User uploads - only authenticated users can upload their own
    match /user-uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }

    // Helper function
    function hasRole(uid, role) {
      return firestore.get(/databases/(default)/documents/users/$(uid))
             .data.role == role;
    }
  }
}
```

---

## Environment Variables to Update

After completing GCP setup, ensure `.env` file contains:

```env
# Firebase Web App Config (from Firebase Console)
VITE_FIREBASE_API_KEY=<YOUR-VALUE>
VITE_FIREBASE_AUTH_DOMAIN=<YOUR-VALUE>
VITE_FIREBASE_PROJECT_ID=maneho-ai
VITE_FIREBASE_STORAGE_BUCKET=<YOUR-VALUE>
VITE_FIREBASE_MESSAGING_SENDER_ID=<YOUR-VALUE>
VITE_FIREBASE_APP_ID=<YOUR-VALUE>
```

---

## Next Steps → Phase 3

After completing Phase 2 manual setup:

1. ✅ Firestore database initialized
2. ✅ Firebase Storage enabled with folders
3. ✅ Security rules applied
4. ✅ Shared Zod schemas defined

**Then proceed to Phase 3:** Vertex AI Vector Search Setup

- Enable Vertex AI API
- Create Vector Search Index (3072 dimensions)
- Deploy index to endpoint
- Add Vertex AI IDs to backend `.env`

---

## Files Modified/Created

```
packages/shared/src/schemas/
├── ask-lawyer.ts (NEW)
├── cost-estimator.ts (NEW)
├── exam-quiz.ts (NEW)
├── ingest-document.ts (NEW)
├── ticket-decoder.ts (NEW)
├── user.ts (existing)
└── index.ts (UPDATED - exports all schemas)
```

---

## Verification Commands

```bash
# Verify schemas compile
cd packages/shared && pnpm typecheck

# Build all packages
pnpm build

# Run tests
pnpm test
```
