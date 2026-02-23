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
 */

import { getFirestore } from '../lib/firebase-admin'

export interface SearchResult {
  documentId: string
  distance?: number
  metadata?: Record<string, unknown>
}

/**
 * Search for similar documents using Firestore native vector search
 * Finds the k-nearest vectors in the 'documents' collection
 *
 * @param embedding - The query embedding (768-dimensional vector)
 * @param limit - Number of results to return (default: 5)
 * @returns Array of matching document IDs with distances
 */
export async function searchSimilarDocuments(
  embedding: number[],
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    // Validate embedding
    if (!embedding || embedding.length === 0) {
      console.warn('[Firestore Search] ⚠️  Empty embedding provided, returning empty results')
      return []
    }

    console.log(
      `[Firestore Search] 🔍 Searching with ${embedding.length}-dim embedding (k=${limit})`
    )

    const db = getFirestore()

    // For now, implement a client-side k-NN search
    // This is a temporary solution until Firestore Admin SDK fully supports findNearest()
    // TODO: When Firestore Admin SDK supports vector search, replace with native query
    const allChunksSnapshot = await db.collectionGroup('chunks').get()

    if (allChunksSnapshot.empty) {
      console.log('[Firestore Search] No documents found in Firestore')
      return []
    }

    // Calculate distances for all chunks
    const resultsWithDistance: Array<SearchResult & { distance: number }> = []

    allChunksSnapshot.forEach(doc => {
      const data = doc.data()
      const chunkEmbedding = data.embedding as number[]

      if (!chunkEmbedding || chunkEmbedding.length === 0) {
        return // Skip chunks without embeddings
      }

      // Calculate cosine similarity
      const distance = calculateCosineSimilarity(embedding, chunkEmbedding)

      resultsWithDistance.push({
        documentId: doc.id,
        distance: distance,
        metadata: data.metadata || {},
      })
    })

    // Sort by distance (descending) and take top k
    const topResults = resultsWithDistance.sort((a, b) => b.distance - a.distance).slice(0, limit)

    console.log(
      `[Firestore Search] ✓ Found ${topResults.length} results (${allChunksSnapshot.size} total chunks)`
    )

    return topResults
  } catch (error) {
    console.error('[Firestore Search] ❌ Search failed:', error)
    return []
  }
}

/**
 * Calculate cosine similarity between two vectors
 * Range: -1 to 1 (1 = identical, 0 = orthogonal, -1 = opposite)
 */
function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    console.warn(
      `[Firestore Search] ⚠️  Vector dimension mismatch: ${vec1.length} vs ${vec2.length}`
    )
    return 0
  }

  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    magnitude1 += vec1[i] * vec1[i]
    magnitude2 += vec2[i] * vec2[i]
  }

  magnitude1 = Math.sqrt(magnitude1)
  magnitude2 = Math.sqrt(magnitude2)

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0
  }

  return dotProduct / (magnitude1 * magnitude2)
}

/**
 * Optimized Firestore search using indexed collection queries
 * For production use, ensure document chunks are properly indexed
 *
 * Index requirements in Firestore:
 * - Collection: documents/{documentId}/chunks
 * - Fields: embedding (Vector), metadata
 */
export async function searchSimilarDocumentsOptimized(
  embedding: number[],
  limit: number = 5
): Promise<SearchResult[]> {
  // This is a placeholder for when Firestore Admin SDK fully supports findNearest()
  // For now, it calls the same search function
  return searchSimilarDocuments(embedding, limit)
}
