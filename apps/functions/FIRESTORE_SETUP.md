# Firestore Storage Setup Guide

This document explains how to set up Firestore storage for the RAG document ingestion pipeline.

## Overview

The Firestore storage module provides persistent storage for documents and chunks:

- **Documents Collection**: Stores document metadata (type, date, chunk count, etc.)
- **Chunks Subcollection**: Stores individual text chunks with embeddings

## Architecture

```
firestore/
├── documents/{documentId}
│   ├── documentType: string
│   ├── year?: number
│   ├── date?: string
│   ├── jurisdiction?: string
│   ├── chunkCount: number
│   ├── status: 'active' | 'archived' | 'processing'
│   ├── totalCharacters?: number
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── chunks/{chunkId}
│       ├── chunkIndex: number
│       ├── text: string
│       ├── embedding: number[]
│       ├── metadata: Record<string, any>
│       └── createdAt: timestamp
```

## Setup Instructions

### 1. Create a Service Account (Local Development)

1. Go to [GCP Console - Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Select your project (`maneho-ai`)
3. Click "Create Service Account"
4. Fill in the details:
   - **Service account name**: `firebase-admin-dev` (or your preference)
   - **Service account ID**: Auto-populated
   - **Description**: "Development Firebase Admin SDK"
5. Click "Create and Continue"
6. Grant these roles:
   - `Cloud Datastore User` (for Firestore)
   - `Firebase Realtime Database User` (optional)
7. Click "Continue"
8. Go to "Keys" tab and create a new JSON key
9. Download and save the JSON file (keep it secure!)

### 2. Configure GOOGLE_APPLICATION_CREDENTIALS

#### Windows PowerShell:

```powershell
# Permanent (add to profile)
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\service-account-key.json"

# Or add to your .env file
# apps/functions/.env
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account-key.json
```

#### Windows CMD:

```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account-key.json
```

#### Linux/Mac:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"

# Or add to .env
# apps/functions/.env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 3. Verify Setup

Run the server and check the startup logs:

```bash
cd apps/functions
npm run dev
```

Look for:

```
[SERVER] 1️⃣  Firebase Admin SDK: ✓ READY
```

If you see `⏳ LAZY-INIT`, it will initialize on first use.

### 4. Test Firestore Integration

Use the provided test scripts:

```bash
# Test document ingestion with Firestore storage
node test-rag-simple.js

# The response should show:
# [Firestore] ✓ Stored document metadata: <documentId>
# [Firestore] ✓ Stored 5 chunks for document: <documentId>
```

## Production Deployment

For production (Google Cloud Run, Cloud Functions), use **Workload Identity Federation**:

1. No service account key needed
2. GCP automatically provides credentials
3. The Firebase Admin SDK detects the environment and uses WIF automatically

Just ensure the Cloud Run service account has:

- `Cloud Datastore User`
- `Firebase Realtime Database User` (if using)

## Firestore Security Rules

Set up proper security rules in the Firestore console:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow reads from authenticated users
    match /documents/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Allow chunks reads
    match /documents/{docId}/chunks/{chunk=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

For development, you can use:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // DEVELOPMENT ONLY!
    }
  }
}
```

## Troubleshooting

### "GOOGLE_APPLICATION_CREDENTIALS not set"

```
[Firebase Admin] ✗ Initialization failed: Error: GCP_PROJECT_ID environment variable not set
```

**Solution**: Set `GCP_PROJECT_ID` in `.env`:

```
GCP_PROJECT_ID=maneho-ai
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
```

### "Permission denied" errors

```
Error: 7 PERMISSION_DENIED: Missing or insufficient permissions
```

**Solution**:

1. Check service account has correct roles
2. Verify Firestore rules allow the operation
3. Ensure `GOOGLE_APPLICATION_CREDENTIALS` points to correct key file

### "Firestore is not initialized"

This error means Firestore couldn't be initialized on startup. Check the logs for:

- Is `GOOGLE_APPLICATION_CREDENTIALS` set?
- Does the key file exist?
- Are permissions correct?

If everything is correct, Firestore will initialize lazily on first request.

## API Reference

### Document Storage

```typescript
import {
  storeDocumentMetadata,
  storeChunks,
  getDocumentMetadata,
  getDocumentChunks,
  updateDocumentStatus,
  deleteDocument,
  getDocumentStats,
} from '../lib/firestore-storage'

// Store document
await storeDocumentMetadata({
  documentId: 'doc-1',
  documentType: 'LTO_TRAFFIC_VIOLATION',
  chunkCount: 10,
  status: 'active',
  year: 2024,
})

// Store chunks
await storeChunks('doc-1', [
  {
    chunkId: 'doc-1_chunk_0',
    chunkIndex: 0,
    text: 'Chunk text here',
    embedding: [0.1, 0.2, ...], // 3072 dimensions
    metadata: { /* ... */ }
  }
])

// Retrieve
const doc = await getDocumentMetadata('doc-1')
const chunks = await getDocumentChunks('doc-1')

// Stats
const stats = await getDocumentStats()
// { totalDocuments: 5, activeDocuments: 4, archivedDocuments: 1, totalChunks: 988 }
```

## Integration with RAG

The document ingestion pipeline now automatically stores documents in Firestore:

```typescript
import { ingestDocument } from './utils/document-processor'

const result = await ingestDocument('doc-1', 'gs://bucket/doc-1.pdf', 'Document text here', {
  documentType: 'LTO_TRAFFIC_VIOLATION',
  year: 2024,
  jurisdiction: 'Philippines',
})

// Result includes Firestore storage status
console.log(result.chunksProcessed) // 10
```

## Firestore Emulator (Optional)

For local development without GCP credentials:

```bash
# Install emulator
firebase init emulators
firebase emulators:start

# Set environment
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

Update `.env`:

```
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

## Next Steps

1. ✅ Set up service account key
2. ✅ Configure `GOOGLE_APPLICATION_CREDENTIALS`
3. ✅ Test document ingestion
4. → Query documents via RAG endpoint
5. → Set up Firestore security rules for production
6. → Monitor Firestore usage in GCP Console
