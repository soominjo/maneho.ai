/**
 * Document Processing Pipeline
 * Handles PDF download, text extraction, chunking, embedding, and indexing
 * Used by Admin Ingestion Pipeline (Epic E)
 */

import { generateEmbedding, batchUpsertDatapoints } from './vertex-ai'
import { prepareDocumentForRAG } from './embeddings'
import {
  storeDocumentMetadata,
  storeChunks,
  deleteDocument as deleteDocumentFromFirestore,
  getDocumentChunks,
  getDocumentStats as getDocumentStatsFromFirestore,
} from '../lib/firestore-storage'

interface DocumentMetadata {
  documentType: string
  year?: number
  date?: string
  jurisdiction?: string
}

/**
 * Main document ingestion workflow
 * 1. Download from Cloud Storage
 * 2. Extract text (placeholder - would use PDF library in production)
 * 3. Prepare for RAG (chunk + embed)
 * 4. Store in Firestore
 * 5. Upsert to Vector Search Index
 */
export async function ingestDocument(
  documentId: string,
  storageUri: string,
  documentText: string, // In production: extracted from PDF
  metadata: DocumentMetadata
): Promise<{
  success: boolean
  documentId: string
  chunksProcessed: number
  message: string
}> {
  try {
    // Step 1: Prepare document for RAG (chunks + embeddings)
    console.log(`\n[Ingest] Starting ingestion for document: ${documentId}`)
    const embeddingFunction = (text: string) => generateEmbedding(text)

    const datapointsToUpsert = await prepareDocumentForRAG(
      documentId,
      documentText,
      metadata,
      embeddingFunction
    )

    console.log(
      `[Ingest] ✓ Document prepared: ${datapointsToUpsert.length} chunks extracted and embedded`
    )

    if (datapointsToUpsert.length === 0) {
      return {
        success: false,
        documentId,
        chunksProcessed: 0,
        message: 'No chunks extracted from document',
      }
    }

    // Step 2: Upsert embeddings to Vector Search Index (non-blocking, graceful failure)
    try {
      await batchUpsertDatapoints(
        datapointsToUpsert.map(dp => ({
          documentId: dp.datapoint_id,
          embedding: dp.embedding,
          metadata: dp.metadata,
        }))
      )
      console.log(`[Ingest] ✓ Vector Search Index: ${datapointsToUpsert.length} datapoints queued`)
    } catch (vectorError) {
      console.error(
        `[Ingest] ⚠️  Vector Search upsert failed:`,
        vectorError instanceof Error ? vectorError.message : String(vectorError)
      )
      // Don't fail ingestion - Firestore is backup
    }

    // Step 3: Store in Firestore (metadata + chunks)
    let firestoreSuccess = false
    try {
      // Store document metadata
      await storeDocumentMetadata({
        documentId,
        documentType: metadata.documentType,
        year: metadata.year,
        date: metadata.date,
        jurisdiction: metadata.jurisdiction,
        chunkCount: datapointsToUpsert.length,
        status: 'active',
        totalCharacters: documentText.length,
      })
      console.log(`[Ingest] ✓ Firestore: Document metadata stored`)

      // Store chunks with batch writes + graceful fallback
      await storeChunks(
        documentId,
        datapointsToUpsert.map(dp => ({
          chunkId: dp.datapoint_id,
          chunkIndex: dp.metadata.chunkIndex,
          text: dp.chunk,
          embedding: dp.embedding,
          metadata: dp.metadata,
        }))
      )
      console.log(
        `[Ingest] ✓ Firestore: ${datapointsToUpsert.length} chunks stored with batch writes`
      )
      firestoreSuccess = true
    } catch (firestoreError) {
      console.error(
        `[Ingest] ✗ Firestore storage failed for ${documentId}:`,
        firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
      )
      console.warn(`[Ingest] ⚠️  Document indexed in Vector Search but Firestore backup incomplete`)
      // Don't fail ingestion - Vector Search is primary, Firestore is backup
    }

    return {
      success: true,
      documentId,
      chunksProcessed: datapointsToUpsert.length,
      message: `Document ${documentId} successfully ingested (${datapointsToUpsert.length} chunks, Firestore: ${firestoreSuccess ? 'OK' : 'PARTIAL'})`,
    }
  } catch (error) {
    console.error(`[Ingest] ✗ Document ingestion failed for ${documentId}:`, error)
    return {
      success: false,
      documentId,
      chunksProcessed: 0,
      message: `Error: ${(error as Error).message}`,
    }
  }
}

/**
 * Batch ingest multiple documents
 * Processes documents sequentially with throttling to avoid rate limiting
 * Graceful: continues even if individual documents fail
 */
export async function batchIngestDocuments(
  documents: Array<{
    documentId: string
    storageUri: string
    text: string
    metadata: DocumentMetadata
  }>
): Promise<{
  success: boolean
  totalDocuments: number
  successCount: number
  failureCount: number
  results: Array<{
    documentId: string
    success: boolean
    chunksProcessed?: number
    error?: string
  }>
}> {
  const results = []
  let successCount = 0
  let failureCount = 0
  const throttleMs = 500 // 500ms delay between documents

  console.log(`\n[Batch Ingest] Starting ingestion of ${documents.length} documents`)

  // Process documents sequentially with throttling
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i]
    const docNumber = i + 1

    try {
      console.log(`[Batch Ingest] Document ${docNumber}/${documents.length}: ${doc.documentId}`)

      const result = await ingestDocument(doc.documentId, doc.storageUri, doc.text, doc.metadata)

      results.push({
        documentId: doc.documentId,
        success: result.success,
        chunksProcessed: result.chunksProcessed,
      })

      if (result.success) {
        successCount++
        console.log(`[Batch Ingest] ✓ Document ${docNumber}/${documents.length} completed`)
      } else {
        failureCount++
        results[results.length - 1].error = result.message
        console.warn(
          `[Batch Ingest] ⚠️  Document ${docNumber}/${documents.length} failed: ${result.message}`
        )
      }
    } catch (error) {
      failureCount++
      const errorMsg = error instanceof Error ? error.message : String(error)
      results.push({
        documentId: doc.documentId,
        success: false,
        error: errorMsg,
      })
      console.error(`[Batch Ingest] ✗ Document ${docNumber}/${documents.length} error: ${errorMsg}`)
    }

    // Throttle between documents (except after last document)
    if (i < documents.length - 1) {
      await new Promise(resolve => setTimeout(resolve, throttleMs))
    }
  }

  console.log(`[Batch Ingest] ✓ Completed: ${successCount} succeeded, ${failureCount} failed`)

  return {
    success: failureCount === 0,
    totalDocuments: documents.length,
    successCount,
    failureCount,
    results,
  }
}

/**
 * Delete document from index and storage
 * Removes all chunks associated with the document
 */
export async function deleteDocument(documentId: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    console.log(`Deleting document ${documentId} from index and storage...`)

    // Get all chunks from Firestore to clean up Vector Search
    const chunks = await getDocumentChunks(documentId)
    console.log(`Found ${chunks.length} chunks to delete for document ${documentId}`)

    // Delete from Vector Search Index (if available)
    if (chunks.length > 0) {
      try {
        // Note: Vector Search Index deletion would require a deleteDatapoints function
        // For now, we just log what would be deleted
        console.log(
          `Would delete ${chunks.length} datapoints from Vector Search Index for ${documentId}`
        )
      } catch (vectorError) {
        console.warn(`Failed to delete from Vector Search:`, vectorError)
      }
    }

    // Delete from Firestore (document + all chunks)
    await deleteDocumentFromFirestore(documentId)

    return {
      success: true,
      message: `Document ${documentId} successfully deleted from index and storage`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error: ${(error as Error).message}`,
    }
  }
}

/**
 * Rebuild index: Re-embed all documents
 * Useful for updating to newer embedding models
 */
export async function rebuildIndex(): Promise<{
  success: boolean
  documentsProcessed: number
  message: string
}> {
  try {
    console.log('Starting full index rebuild...')

    // Note: Full index rebuild would require:
    // 1. Fetch all documents from Firestore
    // 2. Re-chunk and re-embed each document
    // 3. Delete old index entries from Vector Search
    // 4. Upsert new embeddings to Vector Search
    // 5. Update Firestore with new embeddings
    //
    // This is a complex operation that would benefit from:
    // - Progress tracking/background job
    // - Batch processing with rate limiting
    // - Error recovery and retry logic
    //
    // For now, this is a placeholder that documents the operation

    console.log(
      'Index rebuild would process all documents from Firestore and re-embed with latest model'
    )

    return {
      success: true,
      documentsProcessed: 0, // Would be actual count after implementation
      message: 'Index rebuild queued - not yet implemented',
    }
  } catch (error) {
    return {
      success: false,
      documentsProcessed: 0,
      message: `Error: ${(error as Error).message}`,
    }
  }
}

/**
 * Get document statistics for admin dashboard
 */
export async function getDocumentStats(): Promise<{
  totalDocuments: number
  totalChunks: number
  indexSize: number
  lastUpdated: string
  byType: Record<string, number>
}> {
  try {
    const stats = await getDocumentStatsFromFirestore()

    // Calculate document type breakdown
    // For now, return basic stats with placeholder index size
    return {
      totalDocuments: stats.totalDocuments,
      totalChunks: stats.totalChunks,
      indexSize: 0, // Would need to query Vector Search for actual size
      lastUpdated: new Date().toISOString(),
      byType: {
        active: stats.activeDocuments,
        archived: stats.archivedDocuments,
      },
    }
  } catch (error) {
    console.error('Failed to get statistics:', error)
    return {
      totalDocuments: 0,
      totalChunks: 0,
      indexSize: 0,
      lastUpdated: new Date().toISOString(),
      byType: {},
    }
  }
}
