/**
 * Embedding utilities for Vertex AI text-embedding-004 model
 * Handles chunking text and generating embeddings for RAG
 */

const CHUNK_SIZE = 1000 // Characters per chunk
const CHUNK_OVERLAP = 200 // Overlap for context preservation

/**
 * Split text into overlapping chunks for embedding
 */
export function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  if (!text || text.length === 0) {
    return []
  }

  const chunks: string[] = []
  let startIdx = 0

  while (startIdx < text.length) {
    let endIdx = Math.min(startIdx + chunkSize, text.length)

    // Try to break at sentence boundary if possible
    if (endIdx < text.length) {
      const lastPeriod = text.lastIndexOf('.', endIdx)
      const lastNewline = text.lastIndexOf('\n', endIdx)
      const breakPoint = Math.max(lastPeriod, lastNewline)

      if (breakPoint > startIdx + chunkSize * 0.7) {
        endIdx = breakPoint + 1
      }
    }

    const chunk = text.substring(startIdx, endIdx).trim()
    if (chunk.length > 0) {
      chunks.push(chunk)
    }

    // Move start position with overlap
    // Ensure we always move forward by at least 1 character to avoid infinite loops
    const nextStartIdx = Math.max(endIdx - overlap, startIdx + 1)

    // If we're at the end, break
    if (nextStartIdx >= text.length) {
      break
    }

    startIdx = nextStartIdx
  }

  return chunks
}

/**
 * Batch process chunks and generate embeddings
 * Returns array of embeddings with their corresponding chunks
 */
export async function generateChunkEmbeddings(
  chunks: string[],
  embeddingFn: (text: string) => Promise<number[]>
): Promise<Array<{ chunk: string; embedding: number[] }>> {
  const results: Array<{ chunk: string; embedding: number[] }> = []

  // Process in batches of 5 to avoid rate limiting
  const batchSize = 5
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, Math.min(i + batchSize, chunks.length))

    const batchResults = await Promise.all(
      batch.map(async chunk => ({ chunk, embedding: await embeddingFn(chunk) }))
    )

    results.push(...batchResults)

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results
}

/**
 * Prepare document for RAG ingestion:
 * 1. Split into chunks
 * 2. Generate embeddings
 * 3. Return structured data for storage
 */
export async function prepareDocumentForRAG(
  documentId: string,
  text: string,
  metadata: {
    documentType: string
    year?: number
    date?: string
    jurisdiction?: string
  },
  embeddingFn: (text: string) => Promise<number[]>
): Promise<
  Array<{
    datapoint_id: string
    chunk: string
    embedding: number[]
    metadata: typeof metadata & { chunkIndex: number }
  }>
> {
  // Chunk the document
  const chunks = chunkText(text)

  if (chunks.length === 0) {
    throw new Error(`No valid chunks generated from document ${documentId}`)
  }

  // Generate embeddings for each chunk
  const chunkEmbeddings = await generateChunkEmbeddings(chunks, embeddingFn)

  // Format for Vector Search Index and Firestore
  return chunkEmbeddings.map((item, index) => ({
    datapoint_id: `${documentId}_chunk_${index}`,
    chunk: item.chunk,
    embedding: item.embedding,
    metadata: {
      ...metadata,
      chunkIndex: index,
    },
  }))
}

/**
 * Estimate token count (simplified - 1 token ≈ 4 characters)
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}
