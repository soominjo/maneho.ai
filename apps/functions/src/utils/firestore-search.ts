/**
 * Firestore Native Vector Search (Cost-Free Alternative to Vertex AI)
 * Uses Firestore's built-in findNearest() function for $0-cost vector search
 * Replaces expensive Vertex AI Vector Search Index and Endpoint
 *
 * Why Firestore Native?
 * - $0 idle cost (vs. $15-25/month for Vertex AI Endpoint)
 * - Vector queries count as regular Firestore reads
 * - No separate index/endpoint to maintain
 * - Native to our existing Firestore database
 *
 * Prerequisites:
 * - Embeddings must be stored using FieldValue.vector() (see firestore-storage.ts)
 * - A vector index must be created on the 'chunks' collection group:
 *     gcloud firestore indexes composite create \
 *       --collection-group=chunks \
 *       --query-scope=COLLECTION_GROUP \
 *       --field-config=vector-config='{"dimension":"768","flat":{}}',field-path=embedding
 */

import { getFirestore } from '../lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export interface SearchResult {
  documentId: string
  distance?: number
  metadata?: Record<string, unknown>
}

/**
 * Search for similar documents using Firestore native vector search (findNearest)
 * Finds the k-nearest vectors in the 'chunks' collection group
 *
 * @param embedding - The query embedding (768-dimensional vector)
 * @param limit - Number of results to return (default: 5)
 * @returns Array of matching chunk IDs with cosine similarity scores
 */
export async function searchSimilarDocuments(
  embedding: number[],
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    if (!embedding || embedding.length === 0) {
      console.warn('[Firestore Search] Empty embedding provided, returning empty results')
      return []
    }

    console.log(`[Firestore Search] Searching with ${embedding.length}-dim embedding (k=${limit})`)

    const db = getFirestore()

    const vectorQuery = db.collectionGroup('chunks').findNearest({
      vectorField: 'embedding',
      queryVector: FieldValue.vector(embedding),
      limit,
      distanceMeasure: 'COSINE',
      distanceResultField: 'vectorDistance',
    })

    const snapshot = await vectorQuery.get()

    if (snapshot.empty) {
      console.log('[Firestore Search] No matching chunks found')
      return []
    }

    const results: SearchResult[] = snapshot.docs.map(doc => {
      const data = doc.data()
      // Firestore COSINE distance = 1 - cosine_similarity
      // Convert back to cosine similarity for backward compatibility with callers
      const cosineDistance = data.vectorDistance as number | undefined
      const cosineSimilarity = cosineDistance !== undefined ? 1 - cosineDistance : undefined

      return {
        // Use doc.id (the chunk doc ID, e.g. "docId_chunk_0") for backward compat
        // Callers split on "_chunk_" to derive the parent document ID
        documentId: doc.id,
        distance: cosineSimilarity,
        metadata: data.metadata || {},
      }
    })

    console.log(`[Firestore Search] Found ${results.length} results via findNearest()`)

    return results
  } catch (error) {
    console.error('[Firestore Search] Search failed:', error)
    return []
  }
}
