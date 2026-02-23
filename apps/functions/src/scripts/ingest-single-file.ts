/**
 * Single File Document Ingestion from Firebase Storage
 * Ingests one specific file instead of all documents
 *
 * Usage:
 *   pnpm tsx src/scripts/ingest-single-file.ts <folder> <filename>
 *
 * Examples:
 *   pnpm tsx src/scripts/ingest-single-file.ts 07-local-ordinances NCAP_Guidelines.pdf
 *   pnpm tsx src/scripts/ingest-single-file.ts 05-fees-and-penalties fines-schedule.txt
 */

// Load environment variables
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { getStorage } from 'firebase-admin/storage'
import { batchIngestDocuments } from '../utils/document-processor'
import { extractTextWithOCR } from '../utils/ocr-processor'
import { getAdminApp } from '../lib/firebase-admin'

const PROJECT_ID = process.env.GCP_PROJECT_ID || 'maneho-ai'
const STORAGE_BUCKET = `${PROJECT_ID}.firebasestorage.app`
const STORAGE_FOLDER = 'lto-documents'

// Folder categories
const FOLDER_CATEGORY_MAP: Record<string, { type: string; category: string; name: string }> = {
  '01-republic-acts': { type: 'REPUBLIC_ACT', category: 'Republic Acts', name: 'Republic Act' },
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

async function main() {
  // Get folder and filename from command line arguments
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.log('\n❌ Usage: pnpm tsx src/scripts/ingest-single-file.ts <folder> <filename>')
    console.log('\n📁 Available folders:')
    Object.keys(FOLDER_CATEGORY_MAP).forEach(folder => {
      console.log(`   - ${folder}`)
    })
    console.log('\n📝 Examples:')
    console.log(
      '   pnpm tsx src/scripts/ingest-single-file.ts 07-local-ordinances NCAP_Guidelines.pdf'
    )
    console.log(
      '   pnpm tsx src/scripts/ingest-single-file.ts 05-fees-and-penalties fines-schedule.txt'
    )
    process.exit(1)
  }

  const folderName = args[0]
  const filename = args[1]

  console.log('\n📚 Starting Single File Document Ingestion...\n')

  try {
    // Validate folder
    if (!FOLDER_CATEGORY_MAP[folderName]) {
      console.error(`❌ Unknown folder: ${folderName}`)
      console.error('\n📁 Available folders:')
      Object.keys(FOLDER_CATEGORY_MAP).forEach(folder => {
        console.log(`   - ${folder}`)
      })
      process.exit(1)
    }

    const categoryInfo = FOLDER_CATEGORY_MAP[folderName]
    const filePath = `${STORAGE_FOLDER}/${folderName}/${filename}`

    console.log(`📂 Folder: ${folderName} (${categoryInfo.category})`)
    console.log(`📄 File: ${filename}`)
    console.log(`📍 Path: gs://${STORAGE_BUCKET}/${filePath}\n`)

    // Initialize Firebase Admin
    const app = getAdminApp()
    const bucket = getStorage(app).bucket(STORAGE_BUCKET)

    console.log('🔍 Looking for file in Firebase Storage...')

    // Get the file
    const file = bucket.file(filePath)
    const [exists] = await file.exists()

    if (!exists) {
      console.error(`❌ File not found: ${filePath}`)
      console.error(`\n💡 Make sure the file exists at:`)
      console.error(`   gs://${STORAGE_BUCKET}/${filePath}`)
      process.exit(1)
    }

    console.log('✅ File found!\n')

    // Download and extract text
    console.log('📖 Extracting text from file...')
    const [content] = await file.download()

    let text = ''
    const extension = path.extname(filename).toLowerCase()

    if (extension === '.pdf') {
      text = await extractTextWithOCR(content)
      if (!text) {
        console.error('❌ Could not extract text from PDF')
        process.exit(1)
      }
    } else if (extension === '.txt') {
      text = content.toString('utf-8')
    } else {
      console.error(`❌ Unsupported file type: ${extension}`)
      console.error('   Supported: .pdf, .txt')
      process.exit(1)
    }

    console.log(`✅ Extracted ${text.length} characters\n`)

    // Generate document ID
    const documentId = `${folderName}_${filename.replace(/\.[^/.]+$/, '')}`

    console.log(`🔄 Ingesting document: ${documentId}\n`)

    // Ingest the document
    const result = await batchIngestDocuments([
      {
        documentId,
        storageUri: `gs://${STORAGE_BUCKET}/${filePath}`,
        text,
        metadata: {
          documentType: categoryInfo.type,
          category: categoryInfo.category,
          year: 2024,
          jurisdiction: 'Philippines',
          originalFilename: filename,
        },
      },
    ])

    // Display results
    if (result.successCount > 0) {
      console.log('✅ Ingestion Complete!\n')
      console.log(`Document ID: ${documentId}`)
      console.log(`Chunks processed: ${result.results[0].chunksProcessed}`)
      console.log('\n🎉 Document successfully ingested!')
      console.log('\n💡 Now test your RAG system:')
      console.log('   pnpm run test:rag')
    } else {
      console.error('❌ Ingestion failed:')
      console.error(result.results[0].error)
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Fatal Error:', error)
    process.exit(1)
  }
}

main()
