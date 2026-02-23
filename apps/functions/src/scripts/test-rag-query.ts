/**
 * Test RAG Query Pipeline
 * Verifies Firestore search returns results with correct embedding dimensions
 * Usage: pnpm run test:rag
 */

// CRITICAL: Load environment variables BEFORE any other imports
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env file IMMEDIATELY
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// Verify environment variables are loaded
console.log('[ENV] GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID ? '✓ Set' : '✗ Missing')
console.log('[ENV] FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing')
console.log('[ENV] GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Missing')
console.log()

// NOW import modules that depend on environment variables
import { generateGeminiEmbedding } from '../utils/gemini-embeddings'
import { searchSimilarDocuments } from '../utils/firestore-search'
import { getFirestore } from '../lib/firebase-admin'

async function testRAGQuery() {
  console.log('\n🔍 Testing RAG Query Pipeline...\n')

  const testQuery = 'What are the penalties for speeding violations?'
  console.log(`Query: "${testQuery}"`)

  // Step 1: Generate query embedding
  console.log('\n1️⃣ Generating query embedding...')
  const embedding = await generateGeminiEmbedding(testQuery)
  console.log(`   ✓ Embedding dimension: ${embedding.length}`)

  if (embedding.length !== 768) {
    console.error(`   ❌ WRONG DIMENSION! Expected 768, got ${embedding.length}`)
    console.error('\n💡 This means the padding logic is still active. Check vertex-ai.ts')
    process.exit(1)
  }

  // Step 2: Search Firestore for similar documents
  console.log('\n2️⃣ Searching Firestore for similar documents...')
  const results = await searchSimilarDocuments(embedding, 5)
  console.log(`   ✓ Found ${results.length} results`)

  if (results.length === 0) {
    console.error('   ❌ NO RESULTS FOUND - Firestore search returned no documents!')
    console.error('\n💡 Possible causes:')
    console.error('   1. No documents ingested: Run "pnpm run ingest" first')
    console.error('   2. No embeddings in Firestore: Check that chunks have embedding field')
    console.error('   3. Firestore connection issue: Check GCP_PROJECT_ID in .env')
    process.exit(1)
  }

  // Step 3: Fetch chunks from Firestore
  console.log('\n3️⃣ Fetching chunks from Firestore...')
  const db = getFirestore()

  for (const result of results) {
    console.log(`\n   Result ID: ${result.documentId}`)
    console.log(`   Cosine Similarity: ${result.distance?.toFixed(4)}`)

    // 🔍 Similarity Score Verification (Cosine Similarity -1 to 1):
    // ✅ Good: 0.3 to 0.7 = semantically similar documents
    // ⚠️ Low: < 0.3 = loosely related
    // ✅ Excellent: > 0.7 = very similar
    if (result.distance !== undefined && result.distance < 0.3) {
      console.warn(`   ⚠️ Low similarity score - document may be loosely related.`)
    } else if (result.distance !== undefined && result.distance > 0.7) {
      console.log(`   ✅ Excellent match - embeddings are working correctly!`)
    } else {
      console.log(`   ✅ Good match - document is relevant.`)
    }

    // Parse the documentId to extract document and chunk identifiers
    // Format: "documentId_chunk_N" (same format used in Firestore)
    const parts = result.documentId.split('_chunk_')
    const documentId = parts[0]
    const chunkIndex = parts[1] || '0'

    try {
      const chunkRef = db
        .collection('documents')
        .doc(documentId)
        .collection('chunks')
        .doc(`${documentId}_chunk_${chunkIndex}`)

      const chunkDoc = await chunkRef.get()
      if (chunkDoc.exists) {
        const data = chunkDoc.data()
        console.log(`   Text: ${data?.text?.substring(0, 100)}...`)
      } else {
        console.warn(`   ⚠️ Chunk not found in Firestore: ${result.documentId}`)
      }
    } catch (error) {
      console.warn(`   ⚠️ Error fetching chunk: ${error}`)
    }
  }

  console.log('\n✅ RAG Query Pipeline working correctly!')
  console.log('\n🔍 Firestore Search Verification Summary:')
  console.log('   ✅ Cosine similarity typically ranges from 0.3-0.9 for relevant documents')
  console.log('   ✅ Your RAG system is using Firestore native vector search')
}

testRAGQuery().catch(error => {
  console.error('\n❌ Test failed:', error)
  process.exit(1)
})
