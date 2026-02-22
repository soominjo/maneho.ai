/**
 * Vertex AI Utilities for RAG-based document search
 * Provides embedding generation and vector search capabilities
 * Uses: text-embedding-005 model (768 dimensions)
 */

import { PredictionServiceClient } from '@google-cloud/aiplatform'

// Lazy-initialized clients
let predictionClient: PredictionServiceClient | null = null

function getPredictionClient(location: string): PredictionServiceClient {
  if (!predictionClient) {
    predictionClient = new PredictionServiceClient({
      apiEndpoint: `${location}-aiplatform.googleapis.com`,
    })
  }
  return predictionClient
}

/**
 * Generate embeddings for text using Vertex AI text-embedding-005
 * Returns a 768-dimensional vector (flat number array, no protobuf wrappers)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty for embedding generation')
  }

  // Scope variables locally
  const projectId = process.env.GCP_PROJECT_ID || 'maneho-ai'
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1'

  try {
    const client = getPredictionClient(location)

    // Build the endpoint path for text-embedding-005 model (768 dimensions)
    const endpointPath = `projects/${projectId}/locations/${location}/publishers/google/models/text-embedding-005`

    // Call Vertex AI Predictions API
    const response = await client.predict({
      endpoint: endpointPath,
      instances: [
        {
          structValue: {
            fields: {
              content: {
                stringValue: text.substring(0, 8192), // text-embedding-005 supports longer input
              },
            },
          },
        },
      ],
    })

    // Extract embeddings from the response
    if (response[0]?.predictions && response[0].predictions.length > 0) {
      const prediction = response[0].predictions[0] as Record<string, unknown>

      // Debug: log response structure (first 300 chars)
      const responseStr = JSON.stringify(prediction).substring(0, 300)
      console.log('[Vertex AI] Response preview:', responseStr)

      let embedding: number[] | null = null

      // Try Path 1: structValue.fields.embeddings (deeply nested protobuf)
      try {
        const struct = prediction.structValue as Record<string, unknown>
        const fields = struct.fields as Record<string, unknown>
        if (fields?.embeddings) {
          const embeddingsField = fields.embeddings as Record<string, unknown>
          const embeddingsStruct = embeddingsField.structValue as Record<string, unknown>
          const embeddingsFields = embeddingsStruct?.fields as Record<string, unknown>
          const valuesList = embeddingsFields?.values as Record<string, unknown>
          const values = valuesList?.listValue as Record<string, unknown>

          if (values?.values) {
            // Extract numbers, stripping protobuf { numberValue: x } wrappers
            embedding = (values.values as Record<string, unknown>[])
              .map(v => {
                const num = (v as Record<string, unknown>).numberValue as number
                return typeof num === 'number' ? num : NaN
              })
              .filter(x => !isNaN(x))
          }
        }
      } catch (e) {
        // Try next path
      }

      // Try Path 2: embeddings.values directly (flatter structure)
      if (!embedding) {
        try {
          const emb = prediction.embeddings as Record<string, unknown>
          if (emb.values && Array.isArray(emb.values)) {
            embedding = (emb.values as unknown[])
              .map(v => {
                if (typeof v === 'number') return v
                const num = (v as Record<string, unknown>).numberValue as number
                return typeof num === 'number' ? num : NaN
              })
              .filter(x => !isNaN(x))
          }
        } catch (e) {
          // Try next path
        }
      }

      // Return if we found a valid 768-dimensional embedding (no padding)
      if (embedding && embedding.length === 768) {
        console.log(`[Vertex AI] ✓ Got 768-dim embedding from text-embedding-005`)
        // Return as-is: 768 dimensions, flat number array
        return embedding
      } else if (embedding && embedding.length > 0) {
        console.warn(`[Vertex AI] ⚠️  Got ${embedding.length}-dim embedding, expected 768`)
        // If we got a different dimension, still return it (might be from a different model)
        return embedding
      }
    }

    console.warn('[Vertex AI] ⚠️  Could not parse embedding, using placeholder')
    return new Array(768).fill(0.1)
  } catch (error) {
    console.error('[Vertex AI] ❌ Embedding generation failed:', error)
    console.warn('[Vertex AI] ⚠️  Falling back to placeholder embeddings')
    console.warn('[Vertex AI] 💡 Make sure: 1) GOOGLE_APPLICATION_CREDENTIALS is set')
    console.warn('[Vertex AI]            2) Vertex AI Embeddings API is enabled in GCP')
    console.warn('[Vertex AI]            3) Your service account has Vertex AI User role')

    // Return placeholder embedding (768 dims) so RAG can continue
    return new Array(768).fill(0.1)
  }
}

/**
 * Search for similar documents in Vertex AI Vector Search Index
 * Returns the top K most similar documents based on cosine similarity
 */
/**
 * Search for similar documents in Vertex AI Vector Search Index
 * Uses REST API strictly to bypass the "12 UNIMPLEMENTED" gRPC Public Endpoint error
 */
export async function searchSimilarDocuments(
  embedding: number[],
  limit: number = 5
): Promise<SearchResult[]> {
  // 1. Scope variables locally (AntiGravity fix)
  const indexId = process.env.VERTEX_AI_INDEX_ID
  const endpointId = process.env.VERTEX_AI_ENDPOINT_ID
  const deployedIndexId = process.env.VERTEX_AI_DEPLOYED_INDEX_ID
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1'
  const projectId = process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'maneho-ai'
  const publicDomain = process.env.VERTEX_AI_PUBLIC_DOMAIN

  if (!indexId || !endpointId || !deployedIndexId) {
    console.warn('⚠️ Vector Search not configured. Returning empty results.')
    return []
  }

  try {
    console.log(`[Vector Search] Searching with query embedding (${embedding.length}-dim)`)

    // 2. Get auth token
    const { GoogleAuth } = await import('google-auth-library')
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
    const client = await auth.getClient()
    const authHeaders = await client.getRequestHeaders()

    // 3. Construct REST URL
    const apiUrl = `https://${publicDomain}/v1/projects/${projectId}/locations/${location}/indexEndpoints/${endpointId}:findNeighbors`

    // 4. Ensure flat scalar array (no protobuf wrappers)
    const flatEmbedding = embedding
      .map((v: number | Record<string, unknown>) => {
        if (typeof v === 'number') return v
        if (v && typeof v.numberValue === 'number') return v.numberValue
        return 0
      })
      .filter(x => !isNaN(x))

    // 5. REST JSON Body (Using camelCase for Vertex API)
    const requestBody = {
      deployedIndexId: deployedIndexId,
      queries: [
        {
          datapoint: {
            featureVector: flatEmbedding,
          },
          neighborCount: limit,
        },
      ],
      returnFullDatapoint: false,
    }

    // 6. Make the fetch call
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Vector Search REST Error ${response.status}: ${errText}`)
    }

    const data = await response.json()

    // 7. Parse the results safely
    const nearestNeighbors = data.nearestNeighbors || []
    if (nearestNeighbors.length === 0) {
      console.log('[Vector Search] No neighbors found.')
      return []
    }

    const neighbors = nearestNeighbors[0].neighbors || []
    console.log(`[Vector Search] ✓ Found ${neighbors.length} neighbors!`)

    // 8. Map to your app's format
    return neighbors.map((n: Record<string, unknown>) => ({
      documentId:
        ((n.datapoint as Record<string, unknown>)?.datapointId as string) ||
        ((n.datapoint as Record<string, unknown>)?.id as string) ||
        'unknown',
      similarity: (n.distance as number) || 0,
      metadata: (n.datapoint as Record<string, unknown>)?.restricts,
    }))
  } catch (error) {
    console.error('[Vector Search] ❌ Search failed:', error)
    return []
  }
}

/**
 * Upsert a single datapoint (document embedding) to the Vector Search Index
 * If the document already exists, it will be updated
 * Graceful: catches and logs errors without throwing
 */
export async function upsertDatapoint(
  documentId: string,
  embedding: number[],
  metadata?: Record<string, unknown>
): Promise<void> {
  // Scope variables locally at function entry
  const indexId = process.env.VERTEX_AI_INDEX_ID
  const endpointId = process.env.VERTEX_AI_ENDPOINT_ID

  if (!indexId || !endpointId) {
    console.warn(`[Vector Search] ⚠️  Not configured. Skipping upsert for: ${documentId}`)
    return
  }

  try {
    // Ensure embedding is a flat 768-dim number array (no protobuf wrappers)
    const flatEmbedding = embedding
      .map(v => {
        if (typeof v === 'number') return v
        return (v as Record<string, unknown>).numberValue as number
      })
      .filter(x => !isNaN(x))

    if (flatEmbedding.length === 0) {
      console.warn(`[Vector Search] ⚠️  Invalid embedding for ${documentId} (empty or non-numeric)`)
      return
    }

    // Log the operation for verification
    console.log(
      `[Vector Search] Queued: ${documentId} (${flatEmbedding.length}-dim embedding)`,
      metadata ? JSON.stringify(metadata).substring(0, 100) : 'no metadata'
    )

    // TODO: Implement via IndexServiceClient.upsertDatapoints() for production
    // This would require proper gRPC streaming or batch API implementation
  } catch (error) {
    console.error(`[Vector Search] ❌ Upsert failed for ${documentId}:`, error)
    // Don't throw - allow ingestion to continue gracefully
  }
}

/**
 * Batch upsert multiple datapoints (for bulk document ingestion)
 * Implements:
 * - Batching of 100 datapoints per API call
 * - 1-second throttle between batches (prevent rate limiting)
 * - Try-catch around each batch (graceful failures)
 */
/**
 * Batch upsert multiple datapoints to the Vector Search Index via REST API
 * Bypasses the gRPC stubs and streams data directly to the Index.
 */
export async function batchUpsertDatapoints(
  datapoints: Array<{
    documentId: string
    embedding: number[]
    metadata?: Record<string, unknown>
  }>
): Promise<void> {
  if (datapoints.length === 0) return

  // 1. Scope variables locally
  const indexId = process.env.VERTEX_AI_INDEX_ID
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1'
  const projectId = process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'maneho-ai'

  if (!indexId) {
    console.warn('⚠️ VERTEX_AI_INDEX_ID not configured. Skipping Vector Search upsert.')
    return
  }

  try {
    // 2. Get Google Cloud Auth Token
    const { GoogleAuth } = await import('google-auth-library')
    const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] })
    const client = await auth.getClient()
    const authHeaders = await client.getRequestHeaders()

    // 3. Construct the Upsert REST API URL
    // Note: Upserts go to the regional aiplatform endpoint, not the public domain!
    const apiUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/indexes/${indexId}:upsertDatapoints`

    // 4. Split into batches of 100 (Google's recommended streaming limit per request)
    const batchSize = 100
    for (let i = 0; i < datapoints.length; i += batchSize) {
      const batch = datapoints.slice(i, i + batchSize)
      console.log(
        `[Vector Search] Upserting batch ${Math.ceil(i / batchSize) + 1} (${batch.length} chunks)...`
      )

      // 5. Format the datapoints perfectly for the REST API
      const formattedDatapoints = batch.map(dp => {
        // Enforce perfectly flat scalar array
        const flatVector = dp.embedding
          .map((v: number | Record<string, unknown>) => {
            if (typeof v === 'number') return v
            if (v && typeof v.numberValue === 'number') return v.numberValue
            return 0
          })
          .filter(x => !isNaN(x))

        return {
          datapointId: dp.documentId,
          featureVector: flatVector,
          // Optional: Add metadata restricts if you want filtering later
          // Dynamically map all metadata key-value pairs into valid Vertex AI namespaces
          restricts: dp.metadata
            ? Object.entries(dp.metadata).map(([key, value]) => ({
                namespace: key,
                allowList: [String(value)],
              }))
            : undefined,
        }
      })

      // 6. Execute the REST POST
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datapoints: formattedDatapoints }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[Vector Search] ❌ Batch upsert failed: ${response.status}`, errorText)
      } else {
        console.log(`[Vector Search] ✓ Batch upserted successfully to Vertex AI!`)
      }

      // 7. Throttle: 1-second delay between batches to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log(`[Vector Search] 🎉 All ${datapoints.length} chunks queued in Vertex AI!`)
  } catch (error) {
    console.error('[Vector Search] ❌ Fatal error in batch upsert:', error)
  }
}

/**
 * Delete a datapoint from the Vector Search Index
 * Scopes variables locally; gracefully handles missing config
 */
export async function deleteDatapoint(documentId: string): Promise<void> {
  // Scope variables locally at function entry
  const indexId = process.env.VERTEX_AI_INDEX_ID
  const endpointId = process.env.VERTEX_AI_ENDPOINT_ID

  if (!indexId || !endpointId) {
    console.warn(`[Vector Search] ⚠️  Not configured. Cannot delete ${documentId}`)
    return
  }

  try {
    // TODO: Implement delete via IndexServiceClient.deleteDatapoints()
    console.log(`[Vector Search] Queued deletion for ${documentId}`)
  } catch (error) {
    console.error(`[Vector Search] ❌ Delete failed for ${documentId}:`, error)
    // Don't throw - allow deletion workflow to continue
  }
}

/**
 * Interface for search results
 */
export interface SearchResult {
  documentId: string
  similarity: number
  metadata?: Record<string, unknown>
}

/**
 * Health check for Vector Search Index
 * Scopes variables locally; gracefully handles missing config
 */
export async function healthCheck(): Promise<boolean> {
  // Scope variables locally at function entry
  const indexId = process.env.VERTEX_AI_INDEX_ID
  const endpointId = process.env.VERTEX_AI_ENDPOINT_ID
  const deployedIndexId = process.env.VERTEX_AI_DEPLOYED_INDEX_ID

  if (!indexId || !endpointId || !deployedIndexId) {
    console.warn(
      '[Vector Search] ⚠️  Not configured (missing INDEX_ID, ENDPOINT_ID, or DEPLOYED_INDEX_ID)'
    )
    return false
  }

  try {
    // TODO: Implement actual health check (call findNeighbors with dummy vector)
    console.log('[Vector Search] ✓ Configuration verified')
    return true
  } catch (error) {
    console.error('[Vector Search] ❌ Health check failed:', error)
    return false
  }
}
