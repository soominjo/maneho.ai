/**
 * Test single file ingestion for debugging Firestore ingestion
 * Usage: pnpm run test:ingest
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { ingestDocument } from '../utils/document-processor'

async function testSingleIngest() {
  console.log('\n📝 Testing single file ingestion...\n')

  // Test with a small document
  const testDocumentId = 'test-doc-001'
  const testText = `
    TRAFFIC VIOLATION GUIDELINES - TEST DOCUMENT

    This is a test document to verify Firestore ingestion is working.

    Speeding violations:
    - 1-10 km/h over limit: P500 fine
    - 11-20 km/h over limit: P1000 fine
    - 21+ km/h over limit: P2000 fine

    Seatbelt violations:
    - Driver: P1000 fine
    - Passengers: P500 fine

    This test verifies that chunks are properly:
    1. Generated from the text
    2. Embedded via Gemini text-embedding-004 (200x cheaper than Vertex AI)
    3. Stored in Firestore with embeddings
    4. Retrievable via Firestore similarity search
  `

  try {
    console.log(`⏳ Ingesting test document: ${testDocumentId}`)
    console.log(`📄 Text length: ${testText.length} characters\n`)

    const result = await ingestDocument(
      testDocumentId,
      `gs://maneho-ai.firebasestorage.app/test/${testDocumentId}.txt`,
      testText,
      {
        documentType: 'TEST_DOCUMENT',
        year: 2024,
        jurisdiction: 'Philippines',
      }
    )

    console.log('\n✅ Ingestion completed!')
    console.log(`   Document ID: ${result.documentId}`)
    console.log(`   Chunks processed: ${result.chunksProcessed}`)
    console.log(`   Success: ${result.success}`)
    console.log(`   Message: ${result.message}`)

    console.log('\n🔍 Next steps:')
    console.log('1. Check if chunks appear in Firestore (Google Cloud Console)')
    console.log('2. Run the test RAG query: pnpm run test:rag')
    console.log('3. The RAG query should now find results for "speeding violation fine"')
  } catch (error) {
    console.error('\n❌ Ingestion failed:')
    console.error(error)
    process.exit(1)
  }
}

testSingleIngest()
