/**
 * OCR Processor - Extract text from scanned PDFs using Google Cloud Vision
 *
 * Uses batchAnnotateFiles for proper multi-page PDF support.
 * The simpler documentTextDetection only works on single images,
 * not multi-page PDF documents.
 */

import { ImageAnnotatorClient } from '@google-cloud/vision'
import pdfParse from 'pdf-parse'

const visionClient = new ImageAnnotatorClient()

// Vision API batchAnnotateFiles allows max 5 pages per request
const MAX_PAGES_PER_REQUEST = 5

/**
 * Extract text from a PDF buffer using OCR (for scanned documents)
 * Falls back to regular text extraction if available
 */
export async function extractTextWithOCR(buffer: Buffer): Promise<string> {
  try {
    // First, try regular PDF text extraction
    const pdfData = await pdfParse(buffer)

    if (pdfData.text && pdfData.text.trim().length > 100) {
      // Good amount of text extracted, no OCR needed
      return pdfData.text
    }

    // If minimal text, use OCR via Vision API batchAnnotateFiles (handles multi-page PDFs)
    console.log('    📸 Using OCR for text extraction (multi-page PDF)...')
    const totalPages = pdfData.numpages || 1
    console.log(`    📄 PDF has ${totalPages} page(s)`)

    try {
      const allText: string[] = []

      // Process pages in batches of MAX_PAGES_PER_REQUEST
      for (let startPage = 1; startPage <= totalPages; startPage += MAX_PAGES_PER_REQUEST) {
        const endPage = Math.min(startPage + MAX_PAGES_PER_REQUEST - 1, totalPages)
        const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

        console.log(`    🔍 OCR processing pages ${startPage}-${endPage}...`)

        const [result] = await visionClient.batchAnnotateFiles({
          requests: [
            {
              inputConfig: {
                content: buffer.toString('base64'),
                mimeType: 'application/pdf',
              },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
              pages,
            },
          ],
        })

        // Extract text from each page response
        const fileResponse = result.responses?.[0]
        if (fileResponse?.responses) {
          for (const pageResponse of fileResponse.responses) {
            const pageText = pageResponse.fullTextAnnotation?.text
            if (pageText) {
              allText.push(pageText)
            }
          }
        }
      }

      const fullText = allText.join('\n\n')

      if (fullText.trim().length > 0) {
        console.log(
          `    ✓ OCR extraction successful (${fullText.length} chars from ${totalPages} pages)`
        )
        return fullText
      }

      // Fall back to whatever text we got from pdf-parse
      console.log('    ⚠️  OCR returned no text, falling back to pdf-parse result')
      return pdfData.text || ''
    } catch (ocrError) {
      console.warn('    ⚠️  OCR failed, using basic text extraction:', ocrError)
      return pdfData.text || ''
    }
  } catch (error) {
    console.error('    ❌ PDF extraction failed:', error)
    return ''
  }
}
