/**
 * Sample Data Ingestion Script
 * Run this to populate your RAG database with sample LTO documents
 *
 * Usage: npx tsx src/scripts/ingest-sample-data.ts
 */

import { batchIngestDocuments } from '../utils/document-processor'
import { SAMPLE_LTO_DOCUMENTS } from '../data/sample-documents'

async function main() {
  console.log('\n📚 Starting Sample Data Ingestion...\n')

  try {
    // Prepare documents in the format expected by the ingestion pipeline
    const documentsToIngest = SAMPLE_LTO_DOCUMENTS.map(doc => ({
      documentId: doc.documentId,
      storageUri: `gs://maneho-ai.firebasestorage.app/documents/${doc.documentId}.txt`,
      text: doc.text,
      metadata: doc.metadata,
    }))

    console.log(`Total documents to ingest: ${documentsToIngest.length}`)
    console.log('Documents:')
    documentsToIngest.forEach((doc, idx) => {
      console.log(`  ${idx + 1}. ${doc.documentId} (${doc.text.length} characters)`)
    })

    console.log('\n🔄 Ingesting documents...\n')

    // Call the batch ingestion function
    const result = await batchIngestDocuments(documentsToIngest)

    // Display results
    console.log('\n✅ Ingestion Complete!\n')
    console.log(`Total Documents: ${result.totalDocuments}`)
    console.log(`Successful: ${result.successCount}`)
    console.log(`Failed: ${result.failureCount}`)
    console.log(
      `Success Rate: ${((result.successCount / result.totalDocuments) * 100).toFixed(1)}%`
    )

    console.log('\nDetailed Results:')
    result.results.forEach(res => {
      const icon = res.success ? '✅' : '❌'
      console.log(`${icon} ${res.documentId}`)
      if (res.success) {
        console.log(`   └─ Chunks processed: ${res.chunksProcessed}`)
      } else {
        console.log(`   └─ Error: ${res.error}`)
      }
    })

    if (result.success) {
      console.log('\n🎉 All documents ingested successfully!')
      console.log('📊 Your RAG system is now ready to answer questions about LTO regulations.')
      console.log('\n💡 Try asking: "What are the requirements for vehicle registration?"')
      process.exit(0)
    } else {
      console.log('\n⚠️ Some documents failed to ingest. Check the errors above.')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Fatal Error:', error)
    console.error('\nMake sure:')
    console.error('1. ✅ Backend server is running (pnpm dev in apps/functions)')
    console.error('2. ✅ Firebase Admin SDK is configured')
    console.error('3. ✅ Firestore database is accessible')
    console.error('4. ✅ Vertex AI API is enabled in GCP')
    process.exit(1)
  }
}

// Run the script
main()
