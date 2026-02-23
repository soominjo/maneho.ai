/**
 * Gemini AI Integration for RAG-grounded responses
 * Handles text generation, vision, and instruction-following for Maneho.ai features
 * Uses: Google Generative AI REST API (Gemini Pro model)
 */

// Use gemini-2.5-flash as specified in PDD
// This is the recommended model for cost/quality balance in production
// Available in v1 API
const model = 'gemini-2.5-flash'
const apiBaseUrl = 'https://generativelanguage.googleapis.com/v1/models'

/**
 * Make a request to the Gemini API
 * Note: API key is read at runtime, not at module load time, to ensure dotenv has loaded
 * Note: v1 API doesn't support systemInstruction field, so we include it in the prompt
 */
export async function callGeminiAPI(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY environment variable.')
  }

  try {
    // Combine system prompt with user prompt for v1 API compatibility
    const fullPrompt = `${systemPrompt}\n\n${prompt}`

    const response = await fetch(`${apiBaseUrl}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    if (data.candidates && data.candidates[0]?.content?.parts) {
      return data.candidates[0].content.parts
        .map((part: Record<string, unknown>) => (part.text as string) || '')
        .join('')
    }

    throw new Error('No response from Gemini API')
  } catch (error) {
    console.error('❌ Gemini API call failed:', error)
    throw error
  }
}

interface RAGContext {
  query: string
  sourceDocuments: Array<{
    documentId: string
    chunk: string
    metadata: Record<string, unknown>
  }>
}

interface GeminiResponse {
  content: string
  citations: Array<{
    documentId: string
    chunkText: string
  }>
}

/**
 * Generate RAG-grounded answer using Gemini
 * Takes user query and context from Vector Search results
 * Uses Gemini 1.5 Pro model for high-quality responses
 */
export async function generateRAGAnswer(context: RAGContext): Promise<GeminiResponse> {
  const { query, sourceDocuments } = context

  // Build context from source documents
  const contextText = sourceDocuments
    .map((doc, idx) => `[DOC ${idx + 1}] (ID: ${doc.documentId})\n${doc.chunk}`)
    .join('\n\n')

  const systemPrompt = `You are a knowledgeable Filipino traffic lawyer AI assistant specialized in LTO (Land Transportation Office) regulations, vehicle licensing, and traffic enforcement matters.

Guidelines:
1. Answer based ONLY on the provided documents
2. If information is not in documents, say "I don't have information about this in the LTO documents"
3. Always cite which document you're referencing
4. Be clear, concise, and practical
5. Provide specific regulatory references when available
6. For ambiguous questions, ask for clarification`

  const userPrompt = `Question: ${query}

Context from LTO Documents:
${contextText}

Provide a clear, helpful answer with citations to the specific documents used.`

  try {
    console.log('[RAG] Generating answer via Gemini API...')
    const answerContent = await callGeminiAPI(userPrompt, systemPrompt)

    // Extract citations from source documents
    const citations = sourceDocuments.map(doc => ({
      documentId: doc.documentId,
      chunkText: doc.chunk,
    }))

    return {
      content: answerContent,
      citations,
    }
  } catch (error) {
    console.error('❌ RAG answer generation failed:', error)

    // Fallback: Build a manual answer from source documents
    const sourceText = sourceDocuments
      .map((doc, idx) => `\n### Source ${idx + 1}: ${doc.documentId}\n${doc.chunk}`)
      .join('\n')

    return {
      content: `**Note: LLM response unavailable. Showing relevant documents from RAG:**\n${sourceText}\n\n⚠️ Error: ${(error as Error).message}`,
      citations: sourceDocuments.map(doc => ({
        documentId: doc.documentId,
        chunkText: doc.chunk,
      })),
    }
  }
}

/**
 * Detect MIME type from a URL or default to jpeg
 */
function detectMimeType(url: string): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  }
  return mimeMap[ext || ''] || 'image/jpeg'
}

/**
 * Vision API: Extract text from handwritten/printed ticket images
 * Uses Gemini 2.5 Flash multimodal capability
 * Accepts either an image URL (fetches and base64-encodes) or raw base64 data
 */
export async function extractTicketText(input: {
  imageUrl?: string
  imageBase64?: string
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY environment variable.')
  }

  let base64Data: string
  let mimeType: string

  if (input.imageBase64) {
    // Direct base64 input — strip data URI prefix if present
    const match = input.imageBase64.match(/^data:(image\/\w+);base64,(.+)$/)
    if (match) {
      mimeType = match[1]
      base64Data = match[2]
    } else {
      mimeType = 'image/jpeg'
      base64Data = input.imageBase64
    }
    console.log('[Ticket Decoder] Using provided base64 image data')
  } else if (input.imageUrl) {
    // Fetch the image and convert to base64
    console.log(`[Ticket Decoder] Fetching image from: ${input.imageUrl}`)
    const imageResponse = await fetch(input.imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`)
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    base64Data = imageBuffer.toString('base64')
    mimeType = imageResponse.headers.get('content-type') || detectMimeType(input.imageUrl)
  } else {
    throw new Error('Either imageUrl or imageBase64 must be provided')
  }

  const prompt = `You are analyzing a Philippine traffic enforcement ticket (TVR - Temporary Violation Receipt or similar). Extract ALL text visible on the ticket, including handwritten and printed text.

Structure the output as follows:
- Violation Type(s): (list each violation)
- Date of Violation:
- Time:
- Location/Place:
- Officer Name/Badge:
- Plate Number:
- Vehicle Type:
- Driver Name:
- License Number:
- Fine Amount(s):
- Any other visible text or notes

Be thorough — include every piece of text you can read, even if partially illegible. For unclear text, note it as [unclear: best guess].`

  try {
    const response = await fetch(`${apiBaseUrl}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              { text: prompt },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Gemini Vision API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()

    if (data.candidates && data.candidates[0]?.content?.parts) {
      const extractedText = data.candidates[0].content.parts
        .map((part: Record<string, unknown>) => (part.text as string) || '')
        .join('')

      console.log(`[Ticket Decoder] ✓ Extracted ${extractedText.length} chars from ticket image`)
      return extractedText
    }

    throw new Error('No response from Gemini Vision API')
  } catch (error) {
    console.error('[Ticket Decoder] ❌ Vision extraction failed:', error)
    throw new Error(`Ticket text extraction failed: ${(error as Error).message}`)
  }
}

/**
 * Generate persuasive argument script for traffic situations
 * Used by Argument Script Generator killer feature
 */
export async function generateArgumentScript(
  situation: string,
  applicableLaws: string[]
): Promise<string> {
  const systemPrompt = `You are a helpful assistant creating polite, respectful argument scripts for Filipinos facing traffic enforcement situations.

Create scripts that:
1. Are respectful and compliant with authority
2. Reference applicable laws and regulations
3. Are concise and memorizable
4. Avoid confrontation
5. Follow proper Filipino communication etiquette`

  const userPrompt = `Situation: ${situation}

Applicable Laws/References: ${applicableLaws.join(', ')}

Generate a calm, respectful script to discuss with the traffic enforcer. Make it conversational and respectful.`

  try {
    console.log('[Gemini] Generating argument script...')
    return await callGeminiAPI(userPrompt, systemPrompt)
  } catch (error) {
    console.error('❌ Script generation failed:', error)
    return `⚠️  Could not generate script. Error: ${(error as Error).message}`
  }
}

/**
 * Explain traffic rules and regulations
 * Used by Exam Reviewer feature - explains quiz answers
 */
export async function explainTrafficRule(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  ruleReference?: string
): Promise<string> {
  const systemPrompt = `You are an expert traffic safety educator specializing in Philippine LTO regulations.
Explain traffic rules in a clear, friendly, and educational manner that helps people understand the reasoning behind the rules.`

  const userPrompt = `Traffic Rule Explanation Request

Question: ${question}
User's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}
${ruleReference ? `Reference: ${ruleReference}` : ''}

Provide a clear, helpful explanation of:
1. Why the correct answer is right
2. Why other answers are wrong (if applicable)
3. The underlying traffic safety principle
4. Practical application of the rule`

  try {
    console.log('[Gemini] Explaining traffic rule...')
    return await callGeminiAPI(userPrompt, systemPrompt)
  } catch (error) {
    console.error('❌ Rule explanation failed:', error)
    return `⚠️  Could not generate explanation. Error: ${(error as Error).message}`
  }
}

/**
 * Analyze insurance coverage from pasted text
 * Used by Crisis Manager feature
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function analyzeInsuranceCoverage(insuranceText: string): Promise<{
  coverage: string[]
  limitations: string[]
  recommendedActions: string[]
}> {
  try {
    // TODO: Implement Gemini text generation for insurance policy analysis
    // Parse insuranceText parameter to identify:
    // 1. Coverage details 2. Limitations and exclusions 3. Recommended actions

    return {
      coverage: ['Coverage details will be extracted here'],
      limitations: ['Limitations will be identified here'],
      recommendedActions: ['Recommended actions will be provided here'],
    }
  } catch (error) {
    throw new Error(`Insurance analysis failed: ${(error as Error).message}`)
  }
}

/**
 * Generate license renewal checklist
 * Used by License Wizard feature
 */
export async function generateLicenseChecklist(params: {
  licenseType: 'student' | 'non-professional' | 'professional' | 'renewal'
  age?: number
  isRenewal?: boolean
}): Promise<string[]> {
  try {
    // TODO: Implement with actual LTO requirements from Vector Search
    // Type descriptions: student (Student Permit), non-professional (Non-Professional License),
    // professional (Professional License), renewal (License Renewal)
    const checklist = [
      'Valid valid ID or passport',
      'Medical Certificate (must be within 6 months)',
      'NBI Clearance',
      'Proof of residency',
      'Application forms from LTO',
      `${params.isRenewal ? 'Original Driver License' : 'Graduation Certificate (for Student Permit)'}`,
    ]

    return checklist
  } catch (error) {
    throw new Error(`Checklist generation failed: ${(error as Error).message}`)
  }
}
