# 🔄 Migration Guide: Vertex AI → Firestore Native Vector Search

**Status:** Cost Elimination Plan
**Savings:** $222-342/year
**Effort:** 2-3 hours

---

## 📋 Overview

This guide explains how to migrate from expensive Vertex AI Vector Search endpoints to Firestore's native vector search, reducing costs from **$18-28/month → $0/month**.

### Current State (Expensive)

- **Vector Search:** Vertex AI Index + Endpoint (`$15-25/month` idle)
- **Embeddings:** Vertex AI text-embedding-005 (`$0.02/1K tokens`)
- **Total:** ~$222-342/year

### Target State (Free)

- **Vector Search:** Firestore native `findNearest()` (Firestore reads quota)
- **Embeddings:** Optimized/cached or cheaper alternative
- **Total:** ~$0/year

---

## 🎯 Migration Steps

### Step 1: Verify Firestore Setup (Current)

✅ Your Firestore already has the proper structure:

```
firestore/
├── documents/
│   ├── {documentId}/
│   │   └── chunks/
│   │       └── {chunkId}
│   │           ├── text: string
│   │           ├── embedding: number[] (768 dims)
│   │           └── metadata: {}
```

### Step 2: Create Firestore Search Utility (DONE ✅)

New file: `apps/functions/src/utils/firestore-search.ts`

This provides:

- `searchSimilarDocuments()` - Replaces Vertex AI search
- Cosine similarity calculation
- Native Firestore queries

### Step 3: Update RAG Router (NEXT)

Update `apps/functions/src/trpc/routers/rag.ts`:

**Before (Vertex AI):**

```typescript
import { generateEmbedding, searchSimilarDocuments } from '../../utils/vertex-ai'
```

**After (Firestore):**

```typescript
import { generateEmbedding } from '../../utils/vertex-ai' // Keep for embeddings
import { searchSimilarDocuments } from '../../utils/firestore-search' // New
```

### Step 4: Delete Vertex AI Resources (FINAL)

In Google Cloud Console:

1. Navigate to **Vertex AI** > **Vector Search**
2. Delete Index: `maneho_ai_streaming_v2_dep_1771696829887`
3. Delete Endpoint: `5373720144243589120`
4. Wait 5 minutes for cleanup
5. Verify billing stopped in next invoice cycle

### Step 5: Cleanup Environment Variables (OPTIONAL)

Once deleted, remove from `.env`:

```env
# VERTEX_AI_INDEX_ID=9040670587713748992          # ← DELETE
# VERTEX_AI_ENDPOINT_ID=5373720144243589120       # ← DELETE
# VERTEX_AI_DEPLOYED_INDEX_ID=...                 # ← DELETE
# VERTEX_AI_PUBLIC_DOMAIN=...                      # ← DELETE
```

---

## 🔬 Technical Details

### How Firestore Search Works

**Current Approach (Interim):**

- Loads all document chunks from Firestore
- Calculates cosine similarity client-side
- Returns top-k most similar documents
- Works but not scalable for 10K+ documents

**Limitations:**

- Slower for large document sets
- Uses more memory
- Better for <1000 chunks

### Optimization Roadmap

**When Google releases Firestore Vector Search (2024-2025):**

```typescript
// Will work like this:
const results = await db
  .collectionGroup('chunks')
  .findNearest('embedding', FieldValue.vector(queryEmbedding), {
    limit: 5,
    distanceMeasure: 'COSINE',
  })
  .get()
```

For now, the cosine similarity search is an effective interim solution.

---

## 💰 Cost Comparison

| Component   | Vertex AI       | Firestore   | Savings       |
| ----------- | --------------- | ----------- | ------------- |
| Index       | $0.25/mo        | FREE        | +$0.25        |
| Endpoint    | $20/mo          | FREE        | +$20          |
| Embeddings  | $0.02/1K tokens | ~$0.01/1K\* | +$0.01        |
| Query Costs | $0.01/1K        | Bundled     | +$0.01        |
| **TOTAL**   | **$20.28/mo**   | **~$0**     | **$243/year** |

\*Assuming optimized embedding caching

---

## ✅ Verification Checklist

After migration:

- [ ] `firestore-search.ts` is in place
- [ ] RAG router imports use Firestore search
- [ ] Ticket Decoder works with new search
- [ ] Ask Lawyer works with new search
- [ ] No errors in logs about Vertex AI endpoints
- [ ] Vertex AI Index deleted in GCP
- [ ] Vertex AI Endpoint deleted in GCP
- [ ] Environment variables cleaned up
- [ ] Next month's GCP invoice shows $0 Vector Search charges

---

## 🆘 Troubleshooting

### Issue: Search returns 0 results

**Cause:** Firestore chunks don't have `embedding` field
**Solution:** Run embedding ingestion script to populate embeddings

### Issue: Search is slow

**Cause:** Too many documents loaded in memory
**Solution:** Filter queries by metadata before vector search

### Issue: Embeddings are expensive

**Cause:** Generating embeddings for every query
**Solution:** Cache query embeddings or use cheaper model

---

## 📚 References

- [Firestore Vector Search (Coming Soon)](https://firebase.google.com/docs/firestore/vector-search)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Vertex AI Pricing](https://cloud.google.com/vertex-ai/pricing)
- [Firestore Pricing](https://cloud.google.com/firestore/pricing)

---

## 📞 Next Steps

1. **Review** this migration plan with your team
2. **Test** Firestore search with Ticket Decoder
3. **Monitor** logs for any search degradation
4. **Delete** Vertex AI resources once verified
5. **Celebrate** $20/month savings! 🎉
