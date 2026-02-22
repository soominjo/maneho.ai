/**
 * Admin Router Test
 * Tests the document ingestion pipeline
 */

import { describe, it, expect } from 'vitest'
import { adminRouter } from './admin'

describe('Admin Router', () => {
  it('ingestDocuments should handle document ingestion', async () => {
    // Create a tRPC caller for testing
    const caller = adminRouter.createCaller({})

    // Test data - single LTO document
    const testDocuments = [
      {
        documentId: 'lto-memo-test-001',
        storageUri: 'gs://maneho-ai.firebasestorage.app/lto-documents/test-memo.pdf',
        text: `
          LTO Memorandum 2024-001

          Subject: Driver's License Renewal Requirements and Fees

          1. RENEWAL REQUIREMENTS
          - Valid identification document
          - Medical certificate (6 months validity)
          - NBI clearance
          - Proof of residency
          - Original driver's license

          2. RENEWAL FEES
          - Non-professional license: P500
          - Professional license: P750
          - Student permit: P300

          3. PENALTIES FOR LATE RENEWAL
          - Per month overdue: P50
          - Maximum penalty: P1,000

          4. VEHICLE REGISTRATION FEES
          - Motorcycle: P400
          - Car: P500
          - Truck: P600
          - Bus: P750

          5. EMISSION TESTING
          - Required for vehicles older than 15 years
          - Cost: P250
          - Valid for 2 years

          6. THIRD-PARTY LIABILITY INSURANCE
          - Minimum coverage: P1,000,000
          - Estimated annual cost: P1,000-P2,000
        `,
        metadata: {
          documentType: 'memorandum' as const,
          year: 2024,
          date: '2024-01-15',
          jurisdiction: 'NCR',
        },
      },
    ]

    // Test the ingestDocuments endpoint
    const result = await caller.ingestDocuments({
      documents: testDocuments,
    })

    console.log('Ingest Result:', JSON.stringify(result, null, 2))

    // Assertions
    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.jobId).toMatch(/^ingest-/)
    expect(result.totalDocuments).toBe(1)
  })

  it('getStats should return system statistics', async () => {
    const caller = adminRouter.createCaller({})

    const result = await caller.getStats()

    console.log('Stats Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.documents).toBeDefined()
    expect(result.index).toBeDefined()
    expect(result.index?.dimensions).toBe(3072)
  })

  it('deleteDocument should handle document deletion', async () => {
    const caller = adminRouter.createCaller({})

    const result = await caller.deleteDocument({
      documentId: 'test-doc-123',
    })

    console.log('Delete Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
  })

  it('rebuildIndex should queue index rebuild', async () => {
    const caller = adminRouter.createCaller({})

    const result = await caller.rebuildIndex()

    console.log('Rebuild Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.jobId).toMatch(/^rebuild-/)
  })
})
