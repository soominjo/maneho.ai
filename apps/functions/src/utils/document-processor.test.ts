/**
 * Document Processor Pipeline Tests
 *
 * Tests ingestDocument, batchIngestDocuments, deleteDocument, getDocumentStats
 * with all external I/O (Gemini embeddings + Firestore) mocked.
 *
 * The real chunkText / prepareDocumentForRAG logic still runs so we get
 * coverage of the chunking → embedding → storage orchestration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock Gemini embedding API — returns a 768-dim fake vector synchronously
vi.mock('./gemini-embeddings', () => ({
  generateGeminiEmbedding: vi.fn(() => Promise.resolve(Array(768).fill(0.05))),
}))

// Mock Firestore storage layer
vi.mock('../lib/firestore-storage', () => ({
  storeDocumentMetadata: vi.fn(() => Promise.resolve({ writeTime: {} })),
  storeChunks: vi.fn(() => Promise.resolve()),
  deleteDocument: vi.fn(() => Promise.resolve()),
  getDocumentStats: vi.fn(() =>
    Promise.resolve({
      totalDocuments: 5,
      totalChunks: 42,
      activeDocuments: 4,
      archivedDocuments: 1,
    })
  ),
}))

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import {
  ingestDocument,
  batchIngestDocuments,
  deleteDocument,
  getDocumentStats,
} from './document-processor'

import { storeDocumentMetadata, storeChunks } from '../lib/firestore-storage'
import { generateGeminiEmbedding } from './gemini-embeddings'

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const DOC_ID = 'lto-memo-001'
const STORAGE_URI = 'gs://maneho-ai.appspot.com/docs/lto-memo-001.pdf'
const METADATA = { documentType: 'lto-memo', year: 2024, jurisdiction: 'PH' }

// A realistic multi-paragraph text that will produce several chunks
const SAMPLE_TEXT = `
  Section 1. Definitions.
  As used in this Act, the term "driver" means any person who drives or is in actual physical control of a vehicle.

  Section 2. License Requirements.
  No person shall drive any motor vehicle on any public highway unless such person holds a valid driver's license.
  The license must be renewed every three (3) years upon payment of the prescribed fee.

  Section 3. Penalties.
  Any person found driving without a valid license shall be fined not less than Five Hundred Pesos (₱500.00)
  and not more than Two Thousand Pesos (₱2,000.00) for the first offense.
  For the second offense, the fine doubles and the vehicle may be impounded.
`.repeat(5) // ~1 500 chars — enough for a few chunks at default settings

// ---------------------------------------------------------------------------
// ingestDocument
// ---------------------------------------------------------------------------

describe('ingestDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success=true for a valid document', async () => {
    const result = await ingestDocument(DOC_ID, STORAGE_URI, SAMPLE_TEXT, METADATA)
    expect(result.success).toBe(true)
  })

  it('echoes the documentId in the result', async () => {
    const result = await ingestDocument(DOC_ID, STORAGE_URI, SAMPLE_TEXT, METADATA)
    expect(result.documentId).toBe(DOC_ID)
  })

  it('reports a non-zero chunksProcessed count', async () => {
    const result = await ingestDocument(DOC_ID, STORAGE_URI, SAMPLE_TEXT, METADATA)
    expect(result.chunksProcessed).toBeGreaterThan(0)
  })

  it('calls storeDocumentMetadata once with the correct documentId', async () => {
    await ingestDocument(DOC_ID, STORAGE_URI, SAMPLE_TEXT, METADATA)
    expect(storeDocumentMetadata).toHaveBeenCalledOnce()
    expect(storeDocumentMetadata).toHaveBeenCalledWith(
      expect.objectContaining({ documentId: DOC_ID })
    )
  })

  it('calls storeChunks once with the correct documentId', async () => {
    await ingestDocument(DOC_ID, STORAGE_URI, SAMPLE_TEXT, METADATA)
    expect(storeChunks).toHaveBeenCalledOnce()
    expect(storeChunks).toHaveBeenCalledWith(DOC_ID, expect.any(Array))
  })

  it('calls generateGeminiEmbedding for each chunk', async () => {
    await ingestDocument(DOC_ID, STORAGE_URI, SAMPLE_TEXT, METADATA)
    // At least 1 embedding call per chunk
    expect(vi.mocked(generateGeminiEmbedding).mock.calls.length).toBeGreaterThan(0)
  })

  it('returns success=false with a message for empty document text', async () => {
    const result = await ingestDocument(DOC_ID, STORAGE_URI, '', METADATA)
    expect(result.success).toBe(false)
    expect(result.chunksProcessed).toBe(0)
    expect(result.message).toMatch(/error/i)
  })

  it('returns success=true even when storeDocumentMetadata throws (graceful Firestore failure)', async () => {
    vi.mocked(storeDocumentMetadata).mockRejectedValueOnce(new Error('Firestore unavailable'))
    const result = await ingestDocument(DOC_ID, STORAGE_URI, SAMPLE_TEXT, METADATA)
    // The function treats Firestore failure as partial, not total failure
    expect(result.success).toBe(true)
    expect(result.message).toContain('PARTIAL')
  })

  it('returns success=true even when storeChunks throws (graceful partial failure)', async () => {
    vi.mocked(storeChunks).mockRejectedValueOnce(new Error('Batch write failed'))
    const result = await ingestDocument(DOC_ID, STORAGE_URI, SAMPLE_TEXT, METADATA)
    expect(result.success).toBe(true)
  })

  it('returns success=false when embedding generation throws', async () => {
    vi.mocked(generateGeminiEmbedding).mockRejectedValueOnce(new Error('API quota exceeded'))
    const result = await ingestDocument(DOC_ID, STORAGE_URI, SAMPLE_TEXT, METADATA)
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/quota exceeded/i)
  })

  it('message includes FIRESTORE:OK when storage succeeds', async () => {
    const result = await ingestDocument(DOC_ID, STORAGE_URI, SAMPLE_TEXT, METADATA)
    expect(result.message).toContain('OK')
  })
})

// ---------------------------------------------------------------------------
// batchIngestDocuments
// ---------------------------------------------------------------------------

describe('batchIngestDocuments', () => {
  const makeDoc = (id: string) => ({
    documentId: id,
    storageUri: `gs://bucket/${id}.pdf`,
    text: SAMPLE_TEXT,
    metadata: METADATA,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success=true when all documents succeed', async () => {
    const docs = [makeDoc('doc-a'), makeDoc('doc-b')]
    const result = await batchIngestDocuments(docs)
    expect(result.success).toBe(true)
    expect(result.successCount).toBe(2)
    expect(result.failureCount).toBe(0)
  })

  it('reports totalDocuments correctly', async () => {
    const docs = [makeDoc('d1'), makeDoc('d2'), makeDoc('d3')]
    const result = await batchIngestDocuments(docs)
    expect(result.totalDocuments).toBe(3)
  })

  it('returns results array with one entry per document', async () => {
    const docs = [makeDoc('x'), makeDoc('y')]
    const result = await batchIngestDocuments(docs)
    expect(result.results).toHaveLength(2)
  })

  it('each result has the correct documentId', async () => {
    const docs = [makeDoc('alpha'), makeDoc('beta')]
    const result = await batchIngestDocuments(docs)
    const ids = result.results.map(r => r.documentId)
    expect(ids).toContain('alpha')
    expect(ids).toContain('beta')
  })

  it('handles empty documents array gracefully', async () => {
    const result = await batchIngestDocuments([])
    expect(result.success).toBe(true)
    expect(result.totalDocuments).toBe(0)
    expect(result.successCount).toBe(0)
    expect(result.failureCount).toBe(0)
  })

  it('counts failures when one document embedding fails', async () => {
    // Fail on the second embedding call
    let callCount = 0
    vi.mocked(generateGeminiEmbedding).mockImplementation(() => {
      callCount++
      if (callCount > 2) {
        return Promise.reject(new Error('embedding error'))
      }
      return Promise.resolve(Array(768).fill(0.05))
    })

    const docs = [makeDoc('good-doc'), makeDoc('bad-doc')]
    const result = await batchIngestDocuments(docs)
    expect(result.failureCount).toBeGreaterThan(0)
    expect(result.success).toBe(false)
  })

  it('a failed document has error in its result entry', async () => {
    vi.mocked(generateGeminiEmbedding).mockRejectedValueOnce(new Error('quota'))
    const docs = [makeDoc('fail-doc')]
    const result = await batchIngestDocuments(docs)
    expect(result.results[0].success).toBe(false)
    expect(result.results[0].error).toBeTruthy()
  })

  it('continues processing remaining docs after a failure', async () => {
    // Make first doc fail, second succeed
    vi.mocked(generateGeminiEmbedding)
      .mockRejectedValueOnce(new Error('fail-first'))
      .mockResolvedValue(Array(768).fill(0.05))

    const docs = [makeDoc('first'), makeDoc('second')]
    const result = await batchIngestDocuments(docs)
    expect(result.successCount).toBe(1)
    expect(result.failureCount).toBe(1)
    expect(result.results).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// deleteDocument
// ---------------------------------------------------------------------------

import { deleteDocument as deleteDocumentFromStorage } from '../lib/firestore-storage'

describe('deleteDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns success=true when Firestore delete succeeds', async () => {
    const result = await deleteDocument('doc-to-delete')
    expect(result.success).toBe(true)
    expect(result.message).toContain('doc-to-delete')
  })

  it('calls the Firestore deleteDocument function with the correct id', async () => {
    await deleteDocument('my-doc-123')
    expect(deleteDocumentFromStorage).toHaveBeenCalledWith('my-doc-123')
  })

  it('returns success=false when Firestore delete throws', async () => {
    vi.mocked(deleteDocumentFromStorage).mockRejectedValueOnce(new Error('Permission denied'))
    const result = await deleteDocument('protected-doc')
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/Permission denied/i)
  })
})

// ---------------------------------------------------------------------------
// getDocumentStats
// ---------------------------------------------------------------------------

import { getDocumentStats as getStatsFromStorage } from '../lib/firestore-storage'

describe('getDocumentStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns structured stats with totalDocuments and totalChunks', async () => {
    const stats = await getDocumentStats()
    expect(stats.totalDocuments).toBe(5)
    expect(stats.totalChunks).toBe(42)
  })

  it('byType contains active and archived counts', async () => {
    const stats = await getDocumentStats()
    expect(stats.byType).toMatchObject({ active: 4, archived: 1 })
  })

  it('indexSize is 0 (Firestore billing model)', async () => {
    const stats = await getDocumentStats()
    expect(stats.indexSize).toBe(0)
  })

  it('lastUpdated is a valid ISO timestamp', async () => {
    const stats = await getDocumentStats()
    expect(() => new Date(stats.lastUpdated)).not.toThrow()
    expect(new Date(stats.lastUpdated).toISOString()).toBe(stats.lastUpdated)
  })

  it('returns zeroed defaults when Firestore throws', async () => {
    vi.mocked(getStatsFromStorage).mockRejectedValueOnce(new Error('Firestore error'))
    const stats = await getDocumentStats()
    expect(stats.totalDocuments).toBe(0)
    expect(stats.totalChunks).toBe(0)
    expect(stats.byType).toEqual({})
  })
})
