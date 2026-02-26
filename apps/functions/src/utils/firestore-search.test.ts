/**
 * Firestore Search Unit Tests
 *
 * Covers searchSimilarDocuments() with a fully mocked Firestore client.
 * No real network or GCP credentials required.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock declarations — hoisted before imports
// ---------------------------------------------------------------------------

vi.mock('../lib/firebase-admin', () => ({
  getFirestore: vi.fn(),
}))

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    vector: vi.fn((arr: number[]) => arr),
  },
}))

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { searchSimilarDocuments } from './firestore-search'
import { getFirestore } from '../lib/firebase-admin'

// ---------------------------------------------------------------------------
// Helper: build a chainable Firestore collectionGroup mock
// ---------------------------------------------------------------------------

function makeFirestoreMock(
  docs: Array<{ id: string; data: Record<string, unknown> }>,
  isEmpty = false
) {
  const mockGet = vi.fn().mockResolvedValue({
    empty: isEmpty || docs.length === 0,
    docs: docs.map(d => ({
      id: d.id,
      data: () => d.data,
    })),
  })

  const mockFindNearest = vi.fn(() => ({ get: mockGet }))
  const mockCollectionGroup = vi.fn(() => ({ findNearest: mockFindNearest }))

  const mockDb = { collectionGroup: mockCollectionGroup }
  vi.mocked(getFirestore).mockReturnValue(mockDb as unknown as ReturnType<typeof getFirestore>)

  return { mockDb, mockCollectionGroup, mockFindNearest, mockGet }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('searchSimilarDocuments', () => {
  const fakeEmbedding = Array(768).fill(0.1)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it('returns empty array for empty embedding', async () => {
    const result = await searchSimilarDocuments([], 5)
    expect(result).toEqual([])
    expect(getFirestore).not.toHaveBeenCalled()
  })

  it('returns empty array when snapshot is empty', async () => {
    makeFirestoreMock([], true)
    const result = await searchSimilarDocuments(fakeEmbedding, 5)
    expect(result).toEqual([])
  })

  // ── Happy-path results ─────────────────────────────────────────────────────

  it('returns SearchResult array for matching docs', async () => {
    makeFirestoreMock([
      {
        id: 'doc-001_chunk_0',
        data: { vectorDistance: 0.1, metadata: { documentType: 'memo' } },
      },
      {
        id: 'doc-002_chunk_3',
        data: { vectorDistance: 0.25, metadata: {} },
      },
    ])

    const results = await searchSimilarDocuments(fakeEmbedding, 5)
    expect(results).toHaveLength(2)
  })

  it('maps doc.id to SearchResult.documentId', async () => {
    makeFirestoreMock([{ id: 'some-doc_chunk_7', data: { vectorDistance: 0.05, metadata: {} } }])

    const results = await searchSimilarDocuments(fakeEmbedding, 1)
    expect(results[0].documentId).toBe('some-doc_chunk_7')
  })

  it('converts COSINE distance to similarity: distance = 1 - cosineDistance', async () => {
    makeFirestoreMock([{ id: 'chunk-a', data: { vectorDistance: 0.2, metadata: {} } }])

    const results = await searchSimilarDocuments(fakeEmbedding, 1)
    // 1 - 0.2 = 0.8
    expect(results[0].distance).toBeCloseTo(0.8)
  })

  it('handles undefined vectorDistance gracefully (distance = undefined)', async () => {
    makeFirestoreMock([
      { id: 'chunk-b', data: { metadata: {} } }, // no vectorDistance field
    ])

    const results = await searchSimilarDocuments(fakeEmbedding, 1)
    expect(results[0].distance).toBeUndefined()
  })

  it('attaches metadata from document data', async () => {
    makeFirestoreMock([
      {
        id: 'chunk-c',
        data: {
          vectorDistance: 0.15,
          metadata: { documentType: 'lto-memo', year: 2024 },
        },
      },
    ])

    const results = await searchSimilarDocuments(fakeEmbedding, 1)
    expect(results[0].metadata).toEqual({ documentType: 'lto-memo', year: 2024 })
  })

  it('falls back to empty metadata when data.metadata is missing', async () => {
    makeFirestoreMock([
      { id: 'chunk-d', data: { vectorDistance: 0.3 } }, // no metadata key
    ])

    const results = await searchSimilarDocuments(fakeEmbedding, 1)
    expect(results[0].metadata).toEqual({})
  })

  it('returns at most `limit` results', async () => {
    makeFirestoreMock(
      Array.from({ length: 3 }, (_, i) => ({
        id: `chunk-${i}`,
        data: { vectorDistance: 0.1 * i, metadata: {} },
      }))
    )

    // Firestore respects the limit at query time, but our function should not
    // truncate — it returns whatever the snapshot contains
    const results = await searchSimilarDocuments(fakeEmbedding, 3)
    expect(results).toHaveLength(3)
  })

  // ── findNearest call signature ─────────────────────────────────────────────

  it('calls collectionGroup("chunks") on the db', async () => {
    const { mockCollectionGroup } = makeFirestoreMock([])

    await searchSimilarDocuments(fakeEmbedding, 5)

    expect(mockCollectionGroup).toHaveBeenCalledWith('chunks')
  })

  it('calls findNearest with COSINE distance measure', async () => {
    const { mockFindNearest } = makeFirestoreMock([])

    await searchSimilarDocuments(fakeEmbedding, 5)

    expect(mockFindNearest).toHaveBeenCalledWith(
      expect.objectContaining({
        distanceMeasure: 'COSINE',
        vectorField: 'embedding',
        limit: 5,
      })
    )
  })

  it('passes the correct limit to findNearest', async () => {
    const { mockFindNearest } = makeFirestoreMock([])

    await searchSimilarDocuments(fakeEmbedding, 10)

    expect(mockFindNearest).toHaveBeenCalledWith(expect.objectContaining({ limit: 10 }))
  })

  // ── Error handling ─────────────────────────────────────────────────────────

  it('returns empty array when getFirestore throws', async () => {
    vi.mocked(getFirestore).mockImplementation(() => {
      throw new Error('Firestore not initialized')
    })

    const result = await searchSimilarDocuments(fakeEmbedding, 5)
    expect(result).toEqual([])
  })

  it('returns empty array when findNearest.get() rejects', async () => {
    const mockGet = vi.fn().mockRejectedValue(new Error('Network error'))
    const mockFindNearest = vi.fn(() => ({ get: mockGet }))
    const mockCollectionGroup = vi.fn(() => ({ findNearest: mockFindNearest }))
    vi.mocked(getFirestore).mockReturnValue({
      collectionGroup: mockCollectionGroup,
    } as unknown as ReturnType<typeof getFirestore>)

    const result = await searchSimilarDocuments(fakeEmbedding, 5)
    expect(result).toEqual([])
  })
})
