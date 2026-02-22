/**
 * Document Processor Test
 * Tests the document ingestion pipeline
 */

import { describe, it, expect } from 'vitest'
import { chunkText } from './embeddings'

describe('Document Processor', () => {
  it('chunkText should split text into overlapping chunks', () => {
    const longText = `
      LTO Memorandum 2024-001

      Subject: Driver's License Renewal Requirements

      1. All drivers must renew their license within 3 years of expiration.
      2. Renewal requirements include valid ID, medical certificate, and NBI clearance.
      3. The renewal fee for non-professional drivers is P500.
      4. Professional drivers pay P750 for renewal.
      5. Penalties for late renewal are P50 per month, maximum P1,000.
      6. Vehicle registration fees vary by vehicle type.
      7. Motorcycles cost P400 to register.
      8. Cars cost P500 to register.
      9. Trucks cost P600 to register.
      10. Buses cost P750 to register.
    `

    const chunks = chunkText(longText, 150, 30)

    console.log(`Created ${chunks.length} chunks from text`)
    chunks.forEach((chunk, idx) => {
      console.log(`Chunk ${idx + 1} (${chunk.length} chars): ${chunk.substring(0, 50)}...`)
    })

    expect(chunks.length).toBeGreaterThan(1)
    expect(chunks[0].length).toBeLessThanOrEqual(150)
    chunks.forEach(chunk => {
      expect(chunk.length).toBeGreaterThan(0)
    })
  })

  it('should handle empty text', () => {
    const chunks = chunkText('', 1000, 200)
    expect(chunks).toEqual([])
  })

  it('should handle text smaller than chunk size', () => {
    const text = 'Short text'
    const chunks = chunkText(text, 100, 20)
    expect(chunks.length).toBe(1)
    expect(chunks[0]).toBe('Short text')
  })
})
