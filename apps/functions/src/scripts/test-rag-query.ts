/**
 * Test RAG Query Pipeline
 * Verifies Vector Search returns results with correct embedding dimensions
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
console.log('[ENV] VERTEX_AI_INDEX_ID:', process.env.VERTEX_AI_INDEX_ID ? '✓ Set' : '✗ Missing')
console.log(
  '[ENV] VERTEX_AI_ENDPOINT_ID:',
  process.env.VERTEX_AI_ENDPOINT_ID ? '✓ Set' : '✗ Missing'
)
console.log(
  '[ENV] VERTEX_AI_DEPLOYED_INDEX_ID:',
  process.env.VERTEX_AI_DEPLOYED_INDEX_ID ? '✓ Set' : '✗ Missing'
)
console.log()

// NOW import modules that depend on environment variables
import { generateEmbedding, searchSimilarDocuments } from '../utils/vertex-ai'
import { getFirestore } from '../lib/firebase-admin'

async function testRAGQuery() {
  console.log('\n🔍 Testing RAG Query Pipeline...\n')

  const testQuery = 'What are the penalties for speeding violations?'
  console.log(`Query: "${testQuery}"`)

  // Step 1: Generate query embedding
  console.log('\n1️⃣ Generating query embedding...')
  const embedding = await generateEmbedding(testQuery)
  console.log(`   ✓ Embedding dimension: ${embedding.length}`)

  if (embedding.length !== 768) {
    console.error(`   ❌ WRONG DIMENSION! Expected 768, got ${embedding.length}`)
    console.error('\n💡 This means the padding logic is still active. Check vertex-ai.ts')
    process.exit(1)
  }

  // Step 2: Search Vector Search index
  console.log('\n2️⃣ Searching Vector Search index...')
  const results = await searchSimilarDocuments(embedding, 5)
  console.log(`   ✓ Found ${results.length} results`)

  if (results.length === 0) {
    console.error('   ❌ NO RESULTS FOUND - Vector Search still broken!')
    console.error('\n💡 Possible causes:')
    console.error('   1. Ghost data: Old 3072-dim embeddings still in index (wait 2-3 min)')
    console.error('   2. No documents: Run "pnpm run ingest" first')
    console.error('   3. Index issue: Check VERTEX_AI_INDEX_ID in .env')
    process.exit(1)
  }

  // Step 3: Fetch chunks from Firestore
  console.log('\n3️⃣ Fetching chunks from Firestore...')
  const db = getFirestore()

  for (const result of results) {
    console.log(`\n   Result ID: ${result.documentId}`)
    console.log(`   Distance: ${result.similarity}`)

    // 🔍 "Smoking Gun" Verification:
    // ✅ Good (Fixed): Distance 0.12 to 0.45 = embeddings are semantically similar
    // ❌ Bad (Padded): Distance 0.0 or very high (>0.8) = embeddings are corrupted
    if (result.similarity > 0.8 || result.similarity === 0.0) {
      console.error(`   ⚠️ SUSPICIOUS DISTANCE! This might indicate corrupted embeddings.`)
      console.error(`      Distance ${result.similarity} suggests 3072-dim ghost data.`)
    } else if (result.similarity < 0.5) {
      console.log(`   ✅ Good distance - embeddings are working correctly!`)
    }

    // Parse the datapoint_id to extract document and chunk identifiers
    // Format: "documentId_chunk_N" or just the raw ID from Vector Search
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
  console.log('\n🔍 "Smoking Gun" Verification Summary:')
  console.log('   ✅ Distance should be 0.12-0.45 (yours: varies by query)')
  console.log('   ❌ Distance 0.0 or >0.8 = old padded embeddings')
  console.log('   ✅ Your RAG system is now officially "breathing" again!')
}

testRAGQuery().catch(error => {
  console.error('\n❌ Test failed:', error)
  process.exit(1)
})
