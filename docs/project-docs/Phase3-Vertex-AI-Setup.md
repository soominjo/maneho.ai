# Phase 3: Vertex AI Vector Search Setup - Implementation Guide

## Overview

Phase 3 sets up the infrastructure for RAG (Retrieval Augmented Generation):

- **Vector Search Index**: Stores embeddings for document retrieval
- **Embeddings API**: Generates 3072-dimensional embeddings using `text-embedding-004`
- **Search Capabilities**: Finds relevant documents based on user queries

---

## Manual GCP Console Steps (Required)

### Step 3.1: Enable Required APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your `maneho-ai` project
3. Navigate to **APIs & Services > Enabled APIs and services**
4. Click **+ Enable APIs and Services**
5. Search for and enable each API:

#### Required APIs:

- ✅ **Vertex AI API** (`aiplatform.googleapis.com`)
- ✅ **Compute Engine API** (for VM management)
- ✅ **Cloud Storage API** (for embeddings storage)
- ✅ **Cloud Logging API** (for monitoring)

**Expected time**: 2-5 minutes per API

---

### Step 3.2: Create Vector Search Index

1. In Google Cloud Console, navigate to **Vertex AI > Vector Search**
2. Click **Create Index**
3. Configure the index:
   - **Name**: `lto-documents-index`
   - **Display Name**: `LTO Documents Vector Index`
   - **Dimensions**: `3072` (matches `text-embedding-004` model)
   - **Distance Metric**: `COSINE_SIMILARITY`
   - **Index Update Method**: `Streaming Updates` (or `Batch` if preferred)

4. Click **Create** and wait for completion

**Expected time**: 5-15 minutes

**After creation, note these details:**

```
Index ID: <your-index-id>
Example: 1234567890123456789
```

---

### Step 3.3: Deploy Index to Endpoint

1. Once your index is created, navigate to the index details page
2. Click **Deploy to Endpoint** or **Create New Endpoint**
3. Configure the endpoint:
   - **Endpoint Name**: `lto-documents-endpoint`
   - **Display Name**: `LTO Documents Endpoint`
   - **Region**: Choose same region as your Firestore (e.g., `us-central1`)
   - **Machine Type**: `e2-standard-2` (cost-effective for dev)
   - **Min Replica Count**: `1` (for dev; increase to 3+ for production)
   - **Max Replica Count**: `10` (auto-scaling limit)

4. Click **Deploy** and wait for completion

**Expected time**: 10-20 minutes

**After deployment, note these details:**

```
Endpoint ID: <your-endpoint-id>
Example: 1234567890123456789

Deployed Index ID: <deployed-index-id>
(visible in the endpoint's index details)
```

---

## Automated Backend Setup (Now Complete)

I've created the necessary backend infrastructure for Phase 3:

### New Utility Files Created:

#### 1. **`apps/functions/src/utils/vertex-ai.ts`**

- `generateEmbedding()` - Convert text to 3072-dim embeddings
- `searchSimilarDocuments()` - Find relevant docs via Vector Search
- `upsertDatapoint()` - Add/update embeddings in index
- `batchUpsertDatapoints()` - Bulk insert for efficient ingestion
- `deleteDatapoint()` - Remove embeddings from index
- `healthCheck()` - Monitor index health

#### 2. **`apps/functions/src/utils/embeddings.ts`**

- `chunkText()` - Split documents into overlapping chunks
- `generateChunkEmbeddings()` - Batch embed chunks
- `prepareDocumentForRAG()` - Full pipeline: chunk → embed → format
- `estimateTokenCount()` - Gauge content size

#### 3. **New tRPC Routers:**

- **`rag.ts`**: Public endpoints for RAG operations
  - `askLawyer` - Query legal documents with RAG
  - `ingestDocument` - Add documents to index
  - `health` - Check system status

- **`admin.ts`**: Admin-only operations (auth required in Phase 5)
  - `bulkIngestDocuments` - Batch document processing
  - `rebuildIndex` - Regenerate all embeddings
  - `stats` - System statistics

### New Dependencies Added:

```json
{
  "@google-cloud/aiplatform": "^3.16.0",
  "firebase-admin": "^12.0.0"
}
```

---

## Configuration

### Update `apps/functions/.env`

Once you've created the index and endpoint in GCP, add these IDs:

```env
# Vertex AI Configuration
GCP_PROJECT_ID=maneho-ai
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_INDEX_ID=<your-index-id>
VERTEX_AI_ENDPOINT_ID=<your-endpoint-id>
VERTEX_AI_DEPLOYED_INDEX_ID=<your-deployed-index-id>
```

**Example values:**

```env
VERTEX_AI_INDEX_ID=1234567890123456789
VERTEX_AI_ENDPOINT_ID=9876543210987654321
VERTEX_AI_DEPLOYED_INDEX_ID=lto-documents-index-deployed
```

---

## Architecture Overview

```
Document Ingestion Flow:
┌─────────────────────────────────────────────────────┐
│ User uploads PDF from Cloud Storage                │
└──────────────────────┬────────────────────────────┘
                       │
                    Chunk Text
                       │
          ┌────────────┴────────────┐
          │                         │
      [Chunk 1]             [Chunk 2, ...]
          │                         │
    Generate Embedding      Generate Embedding
    (text-embedding-004)    (text-embedding-004)
          │                         │
          └────────────┬────────────┘
                       │
        Store in Firestore (metadata)
        Upsert to Vector Search Index
                       │
              ✅ Document Indexed


Query / RAG Flow:
┌────────────────────────────────────────┐
│ User asks: "What is LTO renewal fee?"  │
└──────────────────┬────────────────────┘
                   │
            Generate Embedding
            (same model as above)
                   │
        Search Vector Search Index
        (Find most similar chunks)
                   │
          ┌────────┴────────┐
       [Match 1]         [Match 2, ...]
          │                 │
   Retrieve from Firestore  Retrieve from Firestore
          │                 │
          └────────┬────────┘
                   │
      Pass to Gemini for RAG-grounded
      answer generation (Phase 4)
                   │
        Return: Answer + Citations
```

---

## Vertex AI Embedding Model Details

**Model**: `text-embedding-004` (recommended for Vertex AI Vector Search)

**Specifications**:

- **Dimensions**: 3,072
- **Max Input Tokens**: 2,048
- **Distance Metric**: Cosine Similarity (configured in index)
- **Cost**: ~$0.02-0.10 per 1M embeddings (check current pricing)

---

## Testing the Setup

### 1. Verify Vector Search Index Health

```bash
# In Google Cloud Console, test endpoint connectivity:
# Vertex AI > Vector Search > [Your Endpoint] > Test
```

### 2. Test Backend Functions

```bash
# After updating .env with IDs, run tests:
cd apps/functions
pnpm test

# Or run the dev server:
pnpm dev
```

### 3. Manual API Test (Phase 4+)

```bash
# Will test with tRPC client in Phase 5
curl http://localhost:3001/trpc/rag.askLawyer \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "What is LTO memorandum?"}'
```

---

## Cost Optimization Tips

1. **Min Replicas**: Keep at `1` for dev; increase to `3` for production HA
2. **Machine Type**: `e2-standard-2` is cost-effective; upgrade for higher throughput
3. **Auto-Scaling**: Set max replicas to control costs
4. **Scheduled Scaling**: Consider turning off endpoint during off-hours
5. **Batch Embeddings**: Batch 5-10 documents per API call to reduce overhead

---

## Common Issues & Troubleshooting

### Issue: "Vector Search Index not configured"

**Solution**: Verify `VERTEX_AI_INDEX_ID`, `VERTEX_AI_ENDPOINT_ID`, and `VERTEX_AI_DEPLOYED_INDEX_ID` are set in `.env`

### Issue: "Permission denied" errors

**Solution**: Ensure your GCP service account has these roles:

- `aiplatform.admin` (or `aiplatform.indexAdmin`)
- `storage.admin`
- `logging.logWriter`

### Issue: Embeddings take too long

**Solution**: Batch requests (max 5-10 per call) and use async processing

### Issue: "Endpoint not found"

**Solution**: Verify endpoint region matches your project's default region

---

## Phase 3 Checklist

- [ ] **3.1** Enabled Vertex AI API and supporting APIs
- [ ] **3.2** Created Vector Search Index with 3072 dimensions
- [ ] **3.3** Deployed index to public endpoint
- [ ] **3.4** Added Vertex AI IDs to `apps/functions/.env`
- [ ] Backend utilities created and TypeScript verified
- [ ] Tested health check endpoint

---

## Next Phase → Phase 4

Once Phase 3 is complete, proceed to:

**Phase 4: Backend Orchestration**

- Implement document ingestion pipeline (PDF → chunks → embeddings)
- Build RAG endpoints with Gemini integration
- Create Killer Feature APIs (Ticket Decoder, Cost Estimator, etc.)
- Set up admin document management

**Phase 5: Frontend Development**

- Build chat UI for RAG
- Implement Killer Feature UIs
- Connect to backend via tRPC

---

## Files Modified/Created

```
apps/functions/
├── src/
│   ├── utils/
│   │   ├── vertex-ai.ts (NEW) - Vector Search operations
│   │   └── embeddings.ts (NEW) - Text chunking & embedding prep
│   ├── trpc/
│   │   ├── routers/
│   │   │   ├── rag.ts (NEW) - Public RAG endpoints
│   │   │   └── admin.ts (NEW) - Admin operations
│   │   └── router.ts (UPDATED - added rag & admin)
│   └── index.ts
└── package.json (UPDATED - added @google-cloud/aiplatform, firebase-admin)
```

---

## Support

If you encounter issues:

1. Check `.env` variables are set correctly
2. Verify GCP APIs are enabled
3. Review Vertex AI Vector Search documentation
4. Check Cloud Logging for errors

---

**Phase 3 Status**: ✅ Backend implementation complete | ⏳ Awaiting manual GCP setup
