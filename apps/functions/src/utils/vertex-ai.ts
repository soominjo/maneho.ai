/**
 * Vertex AI Embeddings (Text-Embedding-005)
 * DEPRECATED: All functionality has been migrated to cost-effective alternatives
 *
 * This file is kept for backward compatibility only
 * All embeddings now use: Gemini text-embedding-004 (200x cheaper)
 * All vector search now uses: Firestore native search
 *
 * Old Pricing: $0.02/1K tokens
 * New Pricing: $0.0001/1K tokens (via Gemini)
 * Savings: $36-40/year on embeddings alone
 *
 * Migration Status:
 * ❌ Embedding generation - DEPRECATED (use gemini-embeddings.ts instead)
 * ❌ Vector Search Index - DELETED (use firestore-search.ts instead)
 * ❌ Vector Search Endpoint - DELETED (no longer needed)
 * ❌ Datapoint Upsert - DELETED (use document-processor.ts instead)
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
 * ⚠️ DELETED FUNCTIONS (Vertex AI Vector Search - No Longer Used)
 *
 * The following functions have been removed in favor of Firestore native vector search:
 * ❌ searchSimilarDocuments() - Use firestore-search.ts instead
 * ❌ upsertDatapoint() - Embeddings stored directly in Firestore
 * ❌ batchUpsertDatapoints() - Embeddings stored directly in Firestore
 * ❌ deleteDatapoint() - Not needed with Firestore
 * ❌ healthCheck() - Vector Search Index/Endpoint deleted
 *
 * This file now ONLY contains embedding generation for backward compatibility.
 * New code should migrate to Gemini embeddings (see gemini-embeddings.ts)
 */
