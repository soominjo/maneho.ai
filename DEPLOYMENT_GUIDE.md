# Maneho.ai Deployment Guide

## Overview

This guide follows your **PDD**, **TDD**, and **To-do** requirements:

- ✅ Firestore for canonical document storage
- ✅ Vertex AI Vector Search for embeddings
- ✅ Workload Identity Federation (WIF) - no service account keys
- ✅ Cloud Run for production

---

## Local Development Setup

### Option A: Use Firestore Emulator (Recommended for Development)

This approach avoids Windows/gRPC dependency issues while maintaining 100% API compatibility.

#### 1. Start the Emulator

```bash
cd d:\RAG\maneho.ai
firebase emulators:start
```

You should see:

```
✔  Firestore Emulator started at http://localhost:8080
✔  Emulator UI available at http://localhost:4000
```

#### 2. Configure Backend to Use Emulator

Update `apps/functions/.env`:

```env
# Use emulator for local development
FIRESTORE_EMULATOR_HOST=localhost:8080

# Still need these for other services
GCP_PROJECT_ID=maneho-ai
GEMINI_API_KEY=<your-api-key>
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_INDEX_ID=<from-gcp>
VERTEX_AI_ENDPOINT_ID=<from-gcp>
VERTEX_AI_DEPLOYED_INDEX_ID=<from-gcp>
```

#### 3. Start Backend

In a new terminal:

```bash
cd apps/functions
npm run dev
```

#### 4. Test

```bash
node test-firestore.js
```

You should see:

```
✅ Firebase Admin SDK initialized
✅ Firestore write successful!
✅ Firestore read successful!
✅ All Firestore operations work!
```

#### 5. Ingest Sample Documents

```bash
npx tsx src/scripts/ingest-sample-data.ts
```

---

## Production Deployment

### Architecture (From Your PDD/TDD)

```
GitHub (with WIF)
    ↓
Google Cloud Build (keyless auth)
    ↓
Cloud Run (with Workload Identity)
    ↓
Firestore + Vertex AI Vector Search (secure)
```

### Prerequisites

✅ Firestore enabled in GCP
✅ Vertex AI Vector Search index created
✅ Workload Identity Federation (WIF) configured
✅ Cloud Run API enabled

### Deployment Steps

#### 1. Build Locally

```bash
cd d:\RAG\maneho.ai
pnpm build
```

#### 2. Deploy via Firebase CLI (Local Dev)

```bash
firebase deploy --only functions
```

#### 3. Deploy via Cloud Run (Production with WIF)

```bash
# Set your environment variables
export GCP_PROJECT_ID="maneho-ai"
export GCP_REGION="us-central1"

# Deploy backend to Cloud Run
gcloud run deploy maneho-api \
  --source apps/functions \
  --region $GCP_REGION \
  --runtime nodejs20 \
  --allow-unauthenticated \
  --set-env-vars \
    GCP_PROJECT_ID=$GCP_PROJECT_ID,\
    GEMINI_API_KEY=$(gcloud secrets versions access latest --secret="gemini-api-key"),\
    VERTEX_AI_LOCATION=$GCP_REGION,\
    VERTEX_AI_INDEX_ID=$(gcloud ai-platform index list --filter="displayName:maneho*" --format="value(name)"),\
    VERTEX_AI_ENDPOINT_ID=$(gcloud ai-platform index-endpoints list --filter="displayName:maneho*" --format="value(name)"),\
    VERTEX_AI_DEPLOYED_INDEX_ID="maneho_ai_1771661588255"
```

#### 4. Configure WIF (GitHub Actions CI/CD)

Set these secrets in GitHub:

- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_SA_EMAIL`: Service account email
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: WIF provider (no keys!)

Example GitHub Actions workflow (`.github/workflows/deploy-main.yml`):

```yaml
name: Deploy to Production

on:
  workflow_dispatch:

env:
  GCP_PROJECT_ID: maneho-ai
  GCP_REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SA_EMAIL }}

      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy maneho-api \
            --source apps/functions \
            --region $GCP_REGION \
            --runtime nodejs20 \
            --allow-unauthenticated \
            --set-env-vars GCP_PROJECT_ID=$GCP_PROJECT_ID
```

---

## Firestore Storage Architecture

Your data in Firestore (from Phase 2 & 3 of To-do):

```firestore
documents/{documentId}
  ├── documentType: "LTO_TRAFFIC_VIOLATION" | "LICENSE_RENEWAL" | ...
  ├── year: 2024
  ├── date: "2024-02-21"
  ├── jurisdiction: "Philippines"
  ├── chunkCount: 10
  ├── status: "active" | "archived"
  ├── totalCharacters: 9000
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  │
  └── chunks/{chunkId}
      ├── text: "Traffic violation fine is P500..."
      ├── embedding: [0.1, 0.2, ..., 0.3] (3072 dimensions)
      ├── chunkIndex: 0
      └── metadata: { documentType, year, ... }
```

---

## Vertex AI Vector Search

From your TDD Phase 3:

1. **Vector Search Index** (created via GCP Console):
   - Dimensions: 3072 (from `gemini-embedding-001`)
   - One public endpoint for cost control

2. **API Integration**:

   ```typescript
   // apps/functions/src/utils/vertex-ai.ts
   const embedding = await generateEmbedding(text) // 3072 dimensions
   await searchSimilarDocuments(embedding, 5) // Top 5 results
   ```

3. **Cost Control**:
   - One index, one endpoint (minimal "always-on" cost)
   - Pay-per-use for embeddings and Vector Search queries

---

## Gemini Integration

From your PDD/TDD:

- **Model**: `gemini-2.5-flash` (from your docs, not gemini-1.5-flash)
- **Use Case**: Chat responses with RAG context
- **Cost**: Pay-per-token

Update `apps/functions/src/utils/gemini.ts`:

```typescript
const model = 'gemini-2.5-flash'
const apiBaseUrl = 'https://generativelanguage.googleapis.com/v1/models'
```

---

## Environment Variables

### Local Development (.env)

```env
# Firestore Emulator
FIRESTORE_EMULATOR_HOST=localhost:8080

# GCP
GCP_PROJECT_ID=maneho-ai

# Gemini API
GEMINI_API_KEY=<get-from-makersuite>

# Vertex AI
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_INDEX_ID=<from-gcp-console>
VERTEX_AI_ENDPOINT_ID=<from-gcp-console>
VERTEX_AI_DEPLOYED_INDEX_ID=maneho_ai_1771661588255
```

### Production (Cloud Run)

Set via `gcloud run deploy --set-env-vars`:

- `GCP_PROJECT_ID` (no Firestore emulator)
- `GEMINI_API_KEY` (via Google Secret Manager)
- `VERTEX_AI_*` variables

---

## Testing Checklist

- [ ] **Local (with Emulator)**:
  - [ ] `firebase emulators:start` works
  - [ ] `npm run dev` in `apps/functions` connects to emulator
  - [ ] `node test-firestore.js` passes
  - [ ] `npx tsx src/scripts/ingest-sample-data.ts` ingests documents
  - [ ] `node test-rag-simple.js` returns RAG answers

- [ ] **Production (Cloud Run)**:
  - [ ] WIF authentication works (no keys needed)
  - [ ] Cloud Run can reach Firestore + Vertex AI
  - [ ] RAG pipeline works with real data
  - [ ] Metrics are logged to Cloud Logging

---

## Key PDD/TDD Compliance

✅ **100% WIF-based** - No stored service account keys
✅ **Firestore + Vertex AI** - True GCP ecosystem (no Pinecone)
✅ **One public endpoint** - Cost-controlled Vector Search
✅ **gemini-2.5-flash** - Optimal cost/quality tradeoff
✅ **Citations mapped to Firestore** - Source documents retrievable

---

## Troubleshooting

### Emulator won't start

```bash
# Kill port 8080
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9
firebase emulators:start
```

### Firestore permission denied in production

Check that Cloud Run service account has `Cloud Datastore User` role:

```bash
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member=serviceAccount:YOUR_SA@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/datastore.user
```

### Vector Search queries returning no results

Verify `VERTEX_AI_INDEX_ID` and `VERTEX_AI_ENDPOINT_ID` in Cloud Console.

---

## Next Steps

1. **Now**: Set up local development with Firestore Emulator
2. **Then**: Fix Gemini model to `gemini-2.5-flash`
3. **Then**: Configure WIF for CI/CD
4. **Finally**: Deploy to Cloud Run

Start with:

```bash
cd d:\RAG\maneho.ai
firebase emulators:start
```
