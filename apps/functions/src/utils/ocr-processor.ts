/**
 * OCR Processor - Extract text from scanned PDFs using Google Cloud Vision
 */

import { ImageAnnotatorClient } from '@google-cloud/vision'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse')

const visionClient = new ImageAnnotatorClient()

/**
 * Extract text from a PDF buffer using OCR (for scanned documents)
 * Falls back to regular text extraction if available
 */
export async function extractTextWithOCR(buffer: Buffer): Promise<string> {
  try {
    // First, try regular PDF text extraction
    const pdfData = await pdfParse(buffer)

    if (pdfData.text && pdfData.text.trim().length > 100) {
      // Good amount of text extracted, return it
      return pdfData.text
    }

    // If minimal text, try OCR on the PDF as an image
    console.log('    📸 Using OCR for text extraction...')

    try {
      // Use Vision API to detect text in the PDF buffer (treated as image)
      const request = {
        image: {
          content: buffer,
        },
      }

      const [result] = await visionClient.documentTextDetection(request)
      const fullText = result.fullTextAnnotation?.text

      if (fullText && fullText.trim().length > 0) {
        console.log('    ✓ OCR extraction successful')
        return fullText
      }

      // Fall back to whatever text we got from pdf-parse
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
