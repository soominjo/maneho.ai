/**
 * Firebase Storage Document Ingestion
 * Ingests documents from Firebase Storage bucket (recursive folder scanning)
 *
 * Supports:
 * - Recursive folder scanning (7 LTO document categories)
 * - PDF text extraction
 * - TXT files
 * - Automatic metadata categorization
 *
 * Usage: pnpm run ingest
 */

// Load environment variables from .env file
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { getStorage } from 'firebase-admin/storage'
import { batchIngestDocuments } from '../utils/document-processor'
import { extractTextWithOCR } from '../utils/ocr-processor'
import { getAdminApp, getFirestore } from '../lib/firebase-admin'

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'maneho-ai'
const STORAGE_BUCKET = `${PROJECT_ID}.firebasestorage.app`
const STORAGE_FOLDER = 'lto-documents'

// Folder to document type mapping (based on folder names)
const FOLDER_CATEGORY_MAP: Record<string, { type: string; category: string; name: string }> = {
  '01-republic-acts': {
    type: 'REPUBLIC_ACT',
    category: 'Republic Acts',
    name: 'Republic Act',
  },
  '02-administrative-orders': {
    type: 'ADMINISTRATIVE_ORDER',
    category: 'Administrative Orders',
    name: 'Administrative Order',
  },
  '03-memorandum-circulars': {
    type: 'MEMORANDUM_CIRCULAR',
    category: 'Memorandum Circulars',
    name: 'Memorandum Circular',
  },
  '04-citizens-charter-and-manuals': {
    type: 'CITIZENS_CHARTER',
    category: 'Citizens Charter & Manuals',
    name: 'Citizens Charter/Manual',
  },
  '05-fees-and-penalties': {
    type: 'FEES_PENALTIES',
    category: 'Fees & Penalties',
    name: 'Fees & Penalties Schedule',
  },
  '06-insurance-and-civil-code': {
    type: 'INSURANCE_CIVIL_CODE',
    category: 'Insurance & Civil Code',
    name: 'Insurance & Civil Code',
  },
  '07-local-ordinances': {
    type: 'LOCAL_ORDINANCE',
    category: 'Local Ordinances',
    name: 'Local Ordinance',
  },
}

/**
 * Extract text from PDF buffer (with OCR fallback for scanned documents)
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  return await extractTextWithOCR(buffer)
}

/**
 * Get document type from folder structure
 * Examples: "01-republic-acts/file.pdf" -> "REPUBLIC_ACT"
 */
function getDocumentTypeFromFolder(
  filePath: string
): { type: string; category: string; name: string } | null {
  const parts = filePath.split('/')
  if (parts.length < 2) return null

  const folderName = parts[0]
  return FOLDER_CATEGORY_MAP[folderName] || null
}

async function main() {
  console.log('\n📚 Starting Firebase Storage Document Ingestion...\n')

  try {
    // Initialize Firebase Admin with Firestore support
    const app = getAdminApp()
    const db = getFirestore()
    console.log('[Ingestion] ✓ Firebase Admin initialized with Firestore access')

    // Test Firestore connection before starting ingestion
    console.log('\n🔍 Testing Firestore connection...')
    try {
      const testDocRef = db.collection('_healthcheck').doc('ingestion-test')
      await testDocRef.set({ timestamp: new Date(), test: true })
      await testDocRef.delete()
      console.log('✅ Firestore connection verified')
    } catch (firestoreError) {
      console.error('❌ Firestore connection FAILED:', firestoreError)
      console.error('\n⚠️  Firestore storage will NOT be available.')
      console.error('Document ingestion requires Firestore.\n')
    }

    const bucket = getStorage(app).bucket(STORAGE_BUCKET)

    console.log(`🔍 Searching for documents in gs://${STORAGE_BUCKET}/${STORAGE_FOLDER}/\n`)

    // Recursively list all files in the storage folder
    const [files] = await bucket.getFiles({ prefix: `${STORAGE_FOLDER}/` })

    // Filter out folders and organize by file type
    const documentFiles = files.filter(f => !f.name.endsWith('/'))

    if (documentFiles.length === 0) {
      console.log('⚠️  No documents found in Firebase Storage!')
      console.log(`   📍 Expected location: gs://${STORAGE_BUCKET}/${STORAGE_FOLDER}/`)
      console.log('\n   Expected folder structure:')
      Object.entries(FOLDER_CATEGORY_MAP).forEach(([folder, { category }]) => {
        console.log(`   - ${folder}/ (${category})`)
      })
      console.log('\n   To ingest documents:')
      console.log(`   1. Upload files to Firebase Storage in categorized folders`)
      console.log('   2. Run: pnpm run ingest')
      process.exit(0)
    }

    console.log(`📄 Found ${documentFiles.length} files:\n`)

    const documentsToIngest = []
    let skippedCount = 0

    // Process each file
    for (const file of documentFiles) {
      const filename = path.basename(file.name)
      const extension = path.extname(filename).toLowerCase()
      const filePath = file.name.replace(`${STORAGE_FOLDER}/`, '')

      // Check if file is in a recognized category folder
      const categoryInfo = getDocumentTypeFromFolder(filePath)
      if (!categoryInfo) {
        console.log(`⏭️  Skipping: ${filename} (not in a recognized category folder)`)
        skippedCount++
        continue
      }

      // Check file type
      if (!['.txt', '.pdf'].includes(extension)) {
        console.log(`⏭️  Skipping: ${filename} (unsupported file type: ${extension})`)
        skippedCount++
        continue
      }

      try {
        // Download file content
        const [content] = await file.download()
        let text = ''

        // Extract text based on file type
        if (extension === '.pdf') {
          console.log(`📖 ${filename}...`)
          text = await extractPdfText(content)
          if (!text) {
            console.log(`   ⚠️  Could not extract text from PDF`)
            skippedCount++
            continue
          }
        } else {
          // TXT file
          text = content.toString('utf-8')
        }

        console.log(`✅ ${filename} (${text.length} chars, ${categoryInfo.category})`)

        // Generate document ID from folder and filename
        const documentId = `${filePath.split('/')[0]}_${filename.replace(/\.[^/.]+$/, '')}`

        documentsToIngest.push({
          documentId: documentId,
          storageUri: `gs://${STORAGE_BUCKET}/${file.name}`,
          text: text,
          metadata: {
            documentType: categoryInfo.type,
            category: categoryInfo.category,
            year: 2024,
            jurisdiction: 'Philippines',
            originalFilename: filename,
          },
        })
      } catch (error) {
        console.error(`❌ Failed to process ${filename}:`, error)
        skippedCount++
      }
    }

    if (documentsToIngest.length === 0) {
      console.log(`\n⚠️  No documents could be processed (${skippedCount} skipped)`)
      process.exit(1)
    }

    console.log(`\n🔄 Ingesting ${documentsToIngest.length} documents...\n`)

    // Ingest documents
    const result = await batchIngestDocuments(documentsToIngest)

    // Display results
    console.log('\n✅ Ingestion Complete!\n')
    console.log(`Total Documents: ${result.totalDocuments}`)
    console.log(`Successful: ${result.successCount}`)
    console.log(`Failed: ${result.failureCount}`)
    if (skippedCount > 0) {
      console.log(`Skipped: ${skippedCount}`)
    }
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
      console.log('\n💡 Try running: node test-rag-simple.js')
      process.exit(0)
    } else {
      console.log('\n⚠️ Some documents failed to ingest. Check the errors above.')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Fatal Error:', error)
    console.error('\nMake sure:')
    console.error('1. ✅ Firebase Storage is enabled and accessible')
    console.error('2. ✅ Documents are uploaded to Firebase Storage in categorized folders')
    console.error('3. ✅ GOOGLE_APPLICATION_CREDENTIALS or gcloud auth is configured')
    console.error('4. ✅ Backend dependencies are installed (pnpm install)')
    console.error('5. ✅ pdf-parse is available for PDF extraction')
    process.exit(1)
  }
}

// Run the script
main()
