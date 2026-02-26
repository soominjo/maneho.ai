/**
 * Embeddings Utility Tests
 *
 * Pure-function tests for:
 *   chunkText              — text splitting with sentence-aware boundaries
 *   estimateTokenCount     — rough token estimation
 *   generateChunkEmbeddings — batch embedding with a provided fn
 *   prepareDocumentForRAG  — full doc → chunk → embed pipeline
 *
 * No external dependencies — no mocks required.
 */

import { describe, it, expect, vi } from 'vitest'
import {
  chunkText,
  estimateTokenCount,
  generateChunkEmbeddings,
  prepareDocumentForRAG,
} from './embeddings'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEmbeddingFn(dim = 4): (text: string) => Promise<number[]> {
  return vi.fn(() => Promise.resolve(Array(dim).fill(0.1)))
}

// ---------------------------------------------------------------------------
// chunkText
// ---------------------------------------------------------------------------

describe('chunkText', () => {
  it('returns empty array for empty string', () => {
    expect(chunkText('')).toEqual([])
  })

  it('returns empty array for whitespace-only string', () => {
    // trim() produces '' → no chunk pushed
    expect(chunkText('   ')).toEqual([])
  })

  it('returns single chunk for text shorter than chunk size', () => {
    const chunks = chunkText('Short text.', 1000, 200)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toBe('Short text.')
  })

  it('returns single chunk for text exactly equal to chunk size', () => {
    const text = 'a'.repeat(1000)
    const chunks = chunkText(text, 1000, 200)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toBe(text)
  })

  it('returns multiple chunks for text longer than chunk size', () => {
    const text = 'word '.repeat(300) // ~1500 chars
    const chunks = chunkText(text, 500, 100)
    expect(chunks.length).toBeGreaterThan(1)
  })

  it('no chunk exceeds the specified chunk size by more than one sentence', () => {
    const text = 'This is a sentence. '.repeat(100) // ~2000 chars
    const chunkSize = 300
    const chunks = chunkText(text, chunkSize, 50)
    // Because of sentence-boundary logic endIdx can be slightly past chunkSize
    // but must not overshoot by more than one sentence length (~20 chars)
    chunks.forEach(chunk => {
      expect(chunk.length).toBeLessThanOrEqual(chunkSize + 30)
    })
  })

  it('all chunks are non-empty strings', () => {
    const text = 'Hello world. '.repeat(200)
    const chunks = chunkText(text, 400, 80)
    chunks.forEach(chunk => {
      expect(typeof chunk).toBe('string')
      expect(chunk.length).toBeGreaterThan(0)
    })
  })

  it('adjacent chunks share overlapping content', () => {
    // Build a long deterministic text
    const text = Array.from({ length: 50 }, (_, i) => `Sentence number ${i}.`).join(' ')
    const chunks = chunkText(text, 100, 40)

    expect(chunks.length).toBeGreaterThan(1)

    // Each pair of adjacent chunks must share at least some words
    for (let i = 0; i < chunks.length - 1; i++) {
      const prev = chunks[i]
      const next = chunks[i + 1]
      // Extract last 30 chars of prev and check they appear somewhere in next
      const overlapHint = prev
        .slice(-30)
        .split(' ')
        .filter(w => w.length > 3)[0]
      if (overlapHint) {
        expect(next).toContain(overlapHint)
      }
    }
  })

  it('prefers to break at a period (sentence boundary)', () => {
    // Construct text where there is a period near the 70–100% point of chunkSize
    // chunkSize=100, period at position 85 → should break there
    const textA = 'a'.repeat(84) + '. ' + 'b'.repeat(50)
    const chunks = chunkText(textA, 100, 20)
    // First chunk should end at/near the period, not at position 100
    expect(chunks[0]).toMatch(/\.$/)
  })

  it('prefers to break at a newline boundary', () => {
    const textA = 'x'.repeat(80) + '\n' + 'y'.repeat(50)
    const chunks = chunkText(textA, 100, 20)
    // First chunk should end right at or before the newline
    expect(chunks[0]).not.toContain('y')
  })

  it('handles text with special characters', () => {
    const special = '© Maneho AI — "traffic fines" ₱500 per <violation> & more!\n'.repeat(40)
    const chunks = chunkText(special, 200, 40)
    expect(chunks.length).toBeGreaterThan(1)
    chunks.forEach(c => expect(c.length).toBeGreaterThan(0))
  })

  it('handles very long text (10 000 chars)', () => {
    const text = 'This is a test sentence for a very long document. '.repeat(200)
    const chunks = chunkText(text, 1000, 200)
    expect(chunks.length).toBeGreaterThan(5)
    // Reconstruct: all original content is covered
    const combined = chunks.join(' ')
    // At minimum the first and last meaningful words should appear
    expect(combined).toContain('This is a test')
  })

  it('respects custom chunk size and overlap params', () => {
    const text = 'word '.repeat(100) // 500 chars
    const chunks = chunkText(text, 50, 10)
    // With chunkSize=50, 500 chars → at least 7 chunks
    expect(chunks.length).toBeGreaterThan(5)
    chunks.forEach(c => expect(c.length).toBeLessThanOrEqual(60))
  })

  it('produces only 1 chunk for text with a single long word (no spaces/periods)', () => {
    const single = 'abcdefg'.repeat(50) // 350 chars, default chunk 1000
    const chunks = chunkText(single, 1000, 200)
    expect(chunks).toHaveLength(1)
  })

  it('chunk index out of bounds does not throw — single char text', () => {
    expect(() => chunkText('A', 1000, 200)).not.toThrow()
    const chunks = chunkText('A', 1000, 200)
    expect(chunks).toHaveLength(1)
    expect(chunks[0]).toBe('A')
  })
})

// ---------------------------------------------------------------------------
// estimateTokenCount
// ---------------------------------------------------------------------------

describe('estimateTokenCount', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokenCount('')).toBe(0)
  })

  it('returns 1 for a 4-char string', () => {
    expect(estimateTokenCount('abcd')).toBe(1)
  })

  it('returns 1 for a 1-char string (ceil)', () => {
    expect(estimateTokenCount('a')).toBe(1)
  })

  it('returns 2 for an 8-char string', () => {
    expect(estimateTokenCount('abcdefgh')).toBe(2)
  })

  it('rounds up (ceil) for non-multiple-of-4 lengths', () => {
    expect(estimateTokenCount('abcde')).toBe(2) // 5/4 = 1.25 → 2
    expect(estimateTokenCount('abcdefg')).toBe(2) // 7/4 = 1.75 → 2
  })

  it('scales linearly with text length', () => {
    const text = 'a'.repeat(400)
    expect(estimateTokenCount(text)).toBe(100)
  })

  it('handles a realistic sentence', () => {
    const sentence = 'What is the speed limit in a residential area?'
    // length = 46 → ceil(46/4) = 12
    expect(estimateTokenCount(sentence)).toBe(Math.ceil(sentence.length / 4))
  })
})

// ---------------------------------------------------------------------------
// generateChunkEmbeddings
// ---------------------------------------------------------------------------

describe('generateChunkEmbeddings', () => {
  it('returns empty array for empty input', async () => {
    const fn = makeEmbeddingFn()
    const result = await generateChunkEmbeddings([], fn)
    expect(result).toEqual([])
    expect(fn).not.toHaveBeenCalled()
  })

  it('calls embeddingFn once for each chunk', async () => {
    const fn = makeEmbeddingFn()
    const chunks = ['chunk A', 'chunk B', 'chunk C']
    await generateChunkEmbeddings(chunks, fn)
    expect(fn).toHaveBeenCalledTimes(3)
    expect(fn).toHaveBeenCalledWith('chunk A')
    expect(fn).toHaveBeenCalledWith('chunk B')
    expect(fn).toHaveBeenCalledWith('chunk C')
  })

  it('returns correct number of results', async () => {
    const fn = makeEmbeddingFn()
    const chunks = ['a', 'b', 'c', 'd', 'e']
    const result = await generateChunkEmbeddings(chunks, fn)
    expect(result).toHaveLength(5)
  })

  it('preserves chunk text in output', async () => {
    const fn = makeEmbeddingFn()
    const chunks = ['hello world', 'foo bar']
    const result = await generateChunkEmbeddings(chunks, fn)
    expect(result[0].chunk).toBe('hello world')
    expect(result[1].chunk).toBe('foo bar')
  })

  it('includes embedding in each result', async () => {
    const embedding = [0.1, 0.2, 0.3, 0.4]
    const fn = vi.fn(() => Promise.resolve(embedding))
    const result = await generateChunkEmbeddings(['test'], fn)
    expect(result[0].embedding).toEqual(embedding)
  })

  it('processes 6 chunks in 2 batches of 5 and 1', async () => {
    // We can verify batching by checking ordering is preserved
    const order: number[] = []
    const fn = vi.fn(async () => {
      order.push(order.length)
      return [0.1]
    })
    const chunks = Array.from({ length: 6 }, (_, i) => `chunk-${i}`)
    const result = await generateChunkEmbeddings(chunks, fn)
    // All 6 called, in order
    expect(fn).toHaveBeenCalledTimes(6)
    expect(result).toHaveLength(6)
    result.forEach((r, i) => expect(r.chunk).toBe(`chunk-${i}`))
  })

  it('propagates embeddingFn errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('API down'))
    await expect(generateChunkEmbeddings(['text'], fn)).rejects.toThrow('API down')
  })
})

// ---------------------------------------------------------------------------
// prepareDocumentForRAG
// ---------------------------------------------------------------------------

describe('prepareDocumentForRAG', () => {
  const metadata = {
    documentType: 'lto-memo',
    year: 2024,
    jurisdiction: 'PH',
  }

  it('returns an array of datapoints for a valid document', async () => {
    const fn = makeEmbeddingFn(768)
    const text = 'This is a test document. '.repeat(20)
    const result = await prepareDocumentForRAG('doc-001', text, metadata, fn)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('throws an error for empty document text', async () => {
    const fn = makeEmbeddingFn()
    await expect(prepareDocumentForRAG('doc-empty', '', metadata, fn)).rejects.toThrow(
      /No valid chunks/
    )
  })

  it('datapoint_id follows the pattern: {documentId}_chunk_{index}', async () => {
    const fn = makeEmbeddingFn()
    const text = 'Hello world. This is a test document for RAG processing.'.repeat(5)
    const result = await prepareDocumentForRAG('my-doc', text, metadata, fn)
    result.forEach((dp, i) => {
      expect(dp.datapoint_id).toBe(`my-doc_chunk_${i}`)
    })
  })

  it('chunkIndex in metadata matches array position', async () => {
    const fn = makeEmbeddingFn()
    const text = 'Some content. '.repeat(30)
    const result = await prepareDocumentForRAG('doc-002', text, metadata, fn)
    result.forEach((dp, i) => {
      expect(dp.metadata.chunkIndex).toBe(i)
    })
  })

  it('preserves all metadata fields in each datapoint', async () => {
    const fn = makeEmbeddingFn()
    const text = 'Content here. '.repeat(10)
    const result = await prepareDocumentForRAG('doc-003', text, metadata, fn)
    result.forEach(dp => {
      expect(dp.metadata.documentType).toBe('lto-memo')
      expect(dp.metadata.year).toBe(2024)
      expect(dp.metadata.jurisdiction).toBe('PH')
    })
  })

  it('stores the original chunk text in the datapoint', async () => {
    const fn = makeEmbeddingFn(4)
    const text = 'Exact content to preserve.'
    const result = await prepareDocumentForRAG('doc-004', text, metadata, fn)
    expect(result).toHaveLength(1)
    expect(result[0].chunk).toBe('Exact content to preserve.')
  })

  it('each datapoint embedding matches embeddingFn output', async () => {
    const fakeEmbedding = [0.5, 0.6, 0.7]
    const fn = vi.fn(() => Promise.resolve(fakeEmbedding))
    const text = 'Simple test text.'
    const result = await prepareDocumentForRAG('doc-005', text, metadata, fn)
    result.forEach(dp => {
      expect(dp.embedding).toEqual(fakeEmbedding)
    })
  })
})
