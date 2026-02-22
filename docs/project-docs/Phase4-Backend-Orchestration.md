# Phase 4: Backend Orchestration - Implementation Complete ✅

## Overview

Phase 4 implements the core backend API orchestration with:

- **Gemini AI Integration** for RAG-grounded answers
- **Document Ingestion Pipeline** for PDF processing
- **5 Killer Features** (Ticket Decoder, Script Generator, Cost Estimator, etc.)
- **Education & Wizard Features** (License Checklist, Quiz, Answer Explanations)
- **Admin Document Management**

---

## What's Been Implemented

### 1. Gemini AI Utilities (`apps/functions/src/utils/gemini.ts`)

Core AI functions for RAG-grounded responses:

- **`generateRAGAnswer()`** - Takes user query + source documents → Returns AI answer + citations
- **`extractTicketText()`** - Vision API: Extract handwritten ticket text
- **`generateArgumentScript()`** - Create persuasive traffic situation scripts
- **`analyzeInsuranceCoverage()`** - Parse insurance policies
- **`explainTrafficRule()`** - Explain quiz answers with regulation context
- **`generateLicenseChecklist()`** - Create personalized requirements

### 2. Document Processing Pipeline (`apps/functions/src/utils/document-processor.ts`)

Handles the complete ingestion workflow:

- **`ingestDocument()`** - Single document: download → extract → chunk → embed → index
- **`batchIngestDocuments()`** - Multiple documents with rate-limit protection
- **`deleteDocument()`** - Remove document from index
- **`rebuildIndex()`** - Re-embed all documents (for model upgrades)
- **`getDocumentStats()`** - Admin statistics

### 3. RAG Router (`apps/functions/src/trpc/routers/rag.ts`)

**Public endpoints for user-facing features:**

#### Epic B: The Lawyer

```typescript
rag.askLawyer({
  query: 'What is the LTO renewal fee for motorcycles?',
})
// Returns: answer + citations from LTO documents
```

#### Epic D: Crisis Manager

```typescript
rag.analyzeInsurance({
  insuranceText: '[pasted insurance policy]',
})
// Returns: coverage details, limitations, recommended actions
```

#### Killer Feature 1: Ticket Decoder

```typescript
rag.decodeTicket({
  imageUrl: 'https://firebasestorage.com/ticket.jpg',
})
// Returns: extracted text, fine amount, citation source
```

#### Killer Feature 2: Argument Script Generator

```typescript
rag.generateArgumentScript({
  situation: 'Officer says I was speeding in school zone',
  hasDocumentation: false,
})
// Returns: respectful script + applicable laws
```

#### Killer Feature 3: Registration Cost Estimator

```typescript
rag.estimateRegistrationCost({
  vehicleType: 'car',
  modelYear: 2018,
  monthsLate: 3,
})
// Returns: baseFee + penalty + emission + TPL = total
```

#### Education: License Checklist

```typescript
rag.getLicenseChecklist({
  category: 'non-professional',
})
// Returns: step-by-step checklist for renewal
```

#### Education: Quiz Generation

```typescript
rag.generateQuiz({
  category: 'non-professional',
  questionCount: 10,
})
// Returns: LTO-based quiz questions
```

#### Education: Answer Explanation

```typescript
rag.explainAnswer({
  question: "What's the speed limit in residential areas?",
  userAnswer: '50 km/h',
  correctAnswer: '30 km/h',
})
// Returns: explanation using Gemini
```

### 4. Admin Router (`apps/functions/src/trpc/routers/admin.ts`)

**Protected endpoints (auth required in Phase 5):**

#### Epic E: Document Ingestion Pipeline

```typescript
admin.ingestDocuments({
  documents: [
    {
      documentId: 'lto-memo-2024-001',
      storageUri: 'gs://maneho-ai/lto-documents/...',
      text: '[extracted PDF text]',
      metadata: {
        documentType: 'memorandum',
        year: 2024,
        jurisdiction: 'NCR',
      },
    },
  ],
})
// Returns: job status, chunks processed per document
```

#### Index Management

```typescript
admin.rebuildIndex()
// Re-embeds all documents (expensive operation)

admin.deleteDocument({ documentId: 'lto-memo-2024-001' })
// Removes document from index

admin.getStats()
// Returns: document count, chunk count, index health
```

---

## Architecture

### RAG Pipeline Flow

```
User Query
    ↓
Generate Embedding (text-embedding-004)
    ↓
Search Vector Search Index (cosine similarity)
    ↓
Retrieve Top-5 Similar Chunks from Index
    ↓
Fetch Full Context from Firestore
    ↓
Format for Gemini (system + context + query)
    ↓
Call Gemini Pro (RAG-grounded answer)
    ↓
Format Response + Add Citations
    ↓
Return to Frontend (answer + sources)
```

### Document Ingestion Flow

```
Admin Uploads PDF to Cloud Storage
    ↓
Call admin.ingestDocuments()
    ↓
Extract Text from PDF
    ↓
Chunk Text (overlapping 1000-char chunks)
    ↓
Generate Embeddings (3072-dim vectors)
    ↓
Batch Upsert to Vector Search Index
    ↓
Store Metadata + Chunks in Firestore
    ↓
✅ Ready for RAG Queries
```

---

## Configuration

### Environment Variables (Already Set)

```env
# Vertex AI (Phase 3 - Complete)
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_INDEX_ID=2013647794132221952
VERTEX_AI_ENDPOINT_ID=5555552979198672896
VERTEX_AI_DEPLOYED_INDEX_ID=maneho_ai_1771661588255

# To add in next step:
# GEMINI_API_KEY=<get-from-google-ai-studio>
```

### Required GCP Setup (Still Needed)

1. **Gemini API Credentials**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create API key
   - Add to `.env`: `GEMINI_API_KEY=<your-key>`

2. **Firestore Setup** (Phase 2 - Complete)
   - Documents collection ✅
   - Quiz questions collection (create or populate)
   - Chunks metadata collection (auto-populated)

3. **Firebase Storage** (Phase 2 - Complete)
   - `/lto-documents/` folder ✅
   - Permission rules ✅

---

## File Structure

```
apps/functions/src/
├── utils/
│   ├── vertex-ai.ts          ← Vector Search operations
│   ├── embeddings.ts          ← Text chunking & embedding prep
│   ├── gemini.ts              ← Gemini AI functions (NEW)
│   └── document-processor.ts  ← Document ingestion pipeline (NEW)
├── trpc/
│   ├── routers/
│   │   ├── user.ts
│   │   ├── rag.ts             ← All user-facing RAG features (EXPANDED)
│   │   └── admin.ts           ← Admin operations (EXPANDED)
│   ├── router.ts
│   └── trpc.ts
└── index.ts
```

---

## API Request/Response Examples

### 1. Ask Lawyer

**Request:**

```json
{
  "query": "What are the penalties for not renewing my driver's license on time?"
}
```

**Response:**

```json
{
  "success": true,
  "answer": "Based on LTO regulations, late renewal penalties are charged on a monthly basis. For every month your license is overdue, you'll incur a penalty fee of approximately P50 per month...",
  "citations": [
    {
      "documentId": "lto-memo-2024-001",
      "chunkText": "[relevant chunk from document]"
    }
  ],
  "sourceCount": 2
}
```

### 2. Estimate Registration Cost

**Request:**

```json
{
  "vehicleType": "car",
  "modelYear": 2018,
  "monthsLate": 3
}
```

**Response:**

```json
{
  "success": true,
  "vehicle": {
    "type": "car",
    "modelYear": 2018,
    "monthsLate": 3
  },
  "costBreakdown": {
    "baseFee": 500,
    "latePenalty": 150,
    "emissionTest": 250,
    "thirdPartyLiability": 1000,
    "total": 1900
  },
  "sources": [...]
}
```

### 3. Decode Ticket

**Request:**

```json
{
  "imageUrl": "https://firebasestorage.com/user-uploads/ticket.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "ticketText": "[OCR extracted text from ticket]",
  "extractedFields": {
    "violationType": "Speeding in school zone",
    "amount": "P2000",
    "date": "Feb 21, 2026"
  },
  "fineDetails": {
    "baseFine": "P2000",
    "penalty": "P500 (violation during school hours)",
    "total": "P2500"
  }
}
```

---

## Testing Phase 4 Endpoints

### Using cURL

```bash
# Ask Lawyer Endpoint
curl -X POST http://localhost:3001/trpc/rag.askLawyer \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is required for LTO renewal?"
  }'

# Admin Ingest Documents
curl -X POST http://localhost:3001/trpc/admin.ingestDocuments \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "documentId": "doc-1",
        "storageUri": "gs://bucket/doc.pdf",
        "text": "[extracted text]",
        "metadata": {
          "documentType": "memorandum",
          "year": 2024
        }
      }
    ]
  }'
```

### Using tRPC Client (Phase 5)

```typescript
// In React component
const { data } = await trpc.rag.askLawyer.useMutation({
  query: 'LTO renewal requirements',
})
```

---

## Next Steps → Phase 5

### Frontend Development

Once Phase 4 endpoints are verified, Phase 5 will:

1. **Chat Interface** - Display RAG answers with clickable citations
2. **Killer Feature UIs**
   - Ticket upload → decoder
   - Situation input → script generator
   - Vehicle form → cost estimator
3. **Education UIs**
   - License wizard with checklist
   - Interactive quiz
   - Explain answer feature
4. **Authentication & Quotas**
   - Firebase Auth integration
   - 20 AI interactions/day limit
5. **tRPC Client Setup**
   - Connect frontend to backend
   - Loading states & error handling

---

## Cost Estimates (Phase 4)

| Service                 | Monthly Estimate | Notes                      |
| ----------------------- | ---------------- | -------------------------- |
| Vertex AI Vector Search | $100-150         | 1-2 replicas, query costs  |
| Gemini API              | $50-100          | 1000+ API calls/month      |
| Firestore               | $25-50           | Documents + chunks storage |
| Cloud Storage           | $10-25           | PDF storage                |
| **Total**               | **$185-325**     | Development tier           |

For production: Add monitoring, compliance, disaster recovery +30-50%

---

## Common Issues & Debugging

### Issue: "Gemini API key not found"

**Solution**: Set `GEMINI_API_KEY` in `apps/functions/.env`

### Issue: "Vector Search endpoint not ready"

**Solution**: Verify endpoint is in "Ready" state in GCP console

### Issue: "Rate limiting errors when ingesting"

**Solution**: Document processor includes 500ms delays between documents. Increase if needed.

### Issue: "Out of order embeddings"

**Solution**: Ensure documents are processed sequentially (batchIngestDocuments handles this)

---

## Phase 4 Completion Checklist

- [x] Gemini AI utilities created
- [x] Document processing pipeline implemented
- [x] RAG router with all user features implemented
- [x] Admin router with ingestion pipeline
- [x] Vertex AI IDs configured in .env
- [x] Build passes TypeScript verification
- [ ] Gemini API key obtained and configured
- [ ] Test all endpoints with sample documents
- [ ] Measure API costs and optimize if needed

---

## Next Phase → Phase 5: Frontend Development

[Link to Phase 5 Guide](./Phase5-Frontend-Development.md)

Ready to build the UI and connect everything together! 🚀
