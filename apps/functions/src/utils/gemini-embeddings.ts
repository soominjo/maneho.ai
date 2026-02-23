/**
 * Vertex AI Text Embeddings (text-embedding-004)
 * Cost-effective replacement for Vertex AI Vector Search
 *
 * Model: text-embedding-004
 * Dimensions: 768 (via outputDimensionality parameter)
 * API: Google Cloud Vertex AI REST endpoint
 * Cost: ~$0.02 per 1k tokens (vs $0.15 per 1M for Gemini API)
 */

import { GoogleAuth } from 'google-auth-library'

const LOCATION = 'us-central1'
const MODEL = 'text-embedding-004'

// Helper to get PROJECT_ID at runtime (after dotenv loads)
function getProjectId(): string {
  const projectId = process.env.GCP_PROJECT_ID
  if (!projectId) {
    throw new Error('GCP_PROJECT_ID environment variable not configured')
  }
  return projectId
}

/**
 * Generate embeddings using Vertex AI API
 * Returns 768-dimensional vectors for Firestore vector search
 *
 * @param text - Text to embed
 * @returns 768-dimensional embedding vector
 */
export async function generateGeminiEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty for embedding generation')
  }

  try {
    const projectId = getProjectId()
    const truncatedText = text.substring(0, 8192) // Safety limit

    console.log(`[Vertex AI Embeddings] 🔗 Generating embedding for text (${text.length} chars)...`)

    // Initialize Google Auth for ADC (Application Default Credentials)
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    })

    const accessToken = await auth.getAccessToken()

    // Call Vertex AI REST API endpoint
    const response = await fetch(
      `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              content: truncatedText,
            },
          ],
          parameters: {
            outputDimensionality: 768,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Vertex AI API error: ${JSON.stringify(error)}`)
    }

    const data = (await response.json()) as Record<string, unknown>
    const predictions = (data.predictions as Array<Record<string, unknown>>) || []

    if (predictions.length === 0) {
      throw new Error('No embedding returned from Vertex AI API')
    }

    const embedding = (predictions[0].embeddings as Record<string, unknown>).values as number[]

    if (!embedding || embedding.length === 0) {
      throw new Error('No values in embedding response')
    }

    console.log(`[Vertex AI Embeddings] ✓ Generated ${embedding.length}-dimensional embedding`)

    return embedding
  } catch (error) {
    console.error('[Vertex AI Embeddings] ❌ Embedding generation failed:', error)
    throw new Error(
      `Embedding generation failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Batch generate embeddings using Vertex AI API
 * More efficient for processing multiple texts
 *
 * @param texts - Array of texts to embed
 * @returns Array of embeddings
 */
export async function generateGeminiBatchEmbeddings(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    throw new Error('Texts array cannot be empty')
  }

  try {
    const projectId = getProjectId()
    console.log(
      `[Vertex AI Embeddings] 🔗 Batch generating embeddings for ${texts.length} texts...`
    )

    // Initialize Google Auth
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform',
    })

    const accessToken = await auth.getAccessToken()

    // Build instances for batch API call
    const instances = texts.map(text => ({
      content: text.substring(0, 8192), // Safety limit
    }))

    // Call Vertex AI batch API
    const response = await fetch(
      `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances,
          parameters: {
            outputDimensionality: 768,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Vertex AI batch API error: ${JSON.stringify(error)}`)
    }

    const data = (await response.json()) as Record<string, unknown>
    const predictions = (data.predictions as Array<Record<string, unknown>>) || []

    // Extract embeddings from predictions
    const embeddings = predictions.map(pred => {
      const values = (pred.embeddings as Record<string, unknown>).values as number[]
      return values || []
    })

    console.log(`[Vertex AI Embeddings] ✓ Batch generated ${embeddings.length} embeddings`)

    return embeddings
  } catch (error) {
    console.error('[Vertex AI Embeddings] ❌ Batch embedding generation failed:', error)
    throw new Error(
      `Batch embedding generation failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Cost information
 * Vertex AI text-embedding-004 is the cost-effective option
 */
export function getCostInfo() {
  return {
    model: 'text-embedding-004',
    cost_per_1k_tokens: 0.02,
    unit: 'USD',
    description: 'Using Vertex AI API directly for cost-effective embeddings',
  }
}
