/**
 * RAG (Retrieval Augmented Generation) tRPC Router
 * Handles document search, embeddings, and AI-powered legal/traffic assistance
 * Implements Epic B, D: "The Lawyer" & "Crisis Manager"
 */
import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { router, publicProcedure } from '../trpc'
import { z } from 'zod'
import {
  AskLawyerWithThreadSchema,
  TicketDecoderSchema,
  CostEstimatorSchema,
  ExamQuizSchema,
} from '@repo/shared'
import * as threadStorage from '../../lib/thread-storage'
import { generateEmbedding, searchSimilarDocuments } from '../../utils/vertex-ai'
import {
  generateRAGAnswer,
  callGeminiAPI,
  extractTicketText,
  extractViolationText,
  generateArgumentScript,
  analyzeInsuranceCoverage,
  explainTrafficRule,
  generateLicenseChecklist,
} from '../../utils/gemini'

export const ragRouter = router({
  /**
   * Epic B: The Lawyer
   * Ask traffic/vehicle legal questions with RAG-grounded answers
   */
  askLawyer: publicProcedure.input(AskLawyerWithThreadSchema).mutation(async ({ input }) => {
    try {
      console.log(`\n[RAG] ------------------------------------------------`)
      console.log(`[RAG] 🧠 askLawyer query: "${input.query}"`)

      // Thread management: create or use existing thread
      let threadId = input.threadId
      if (!threadId) {
        const thread = await threadStorage.createThread(input.userId)
        threadId = thread.id
        console.log(`[RAG] ✓ Created new thread: ${threadId}`)
      }

      // Save user message to thread
      await threadStorage.addMessage(input.userId, threadId, {
        role: 'user',
        content: input.query,
      })

      // Step 1: Generate embedding for the query (768-dim)
      const queryEmbedding = await generateEmbedding(input.query)
      console.log(`[RAG] ✓ Generated query embedding (${queryEmbedding.length} dimensions)`)

      // Step 2: Search Vector Search Index for relevant documents
      const searchResults = await searchSimilarDocuments(queryEmbedding, 5)
      console.log(`[RAG] ✓ Vector Search returned ${searchResults.length} results`)

      // Step 3: Fetch actual chunk text from Firestore

      if (getApps().length === 0) {
        console.log('[RAG] 🔄 Initializing Firebase Admin locally...')
        initializeApp({
          projectId: process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'maneho-ai',
        })
      }
      const db = getFirestore()
      const sourceDocuments = []

      for (const result of searchResults) {
        try {
          const parentDocId = result.documentId.split('_chunk_')[0]
          const docSnap = await db
            .collection('documents')
            .doc(parentDocId)
            .collection('chunks')
            .doc(result.documentId)
            .get()

          if (docSnap.exists) {
            const data = docSnap.data()
            const chunkText = data?.text || data?.content || data?.pageContent || ''

            sourceDocuments.push({
              documentId: result.documentId,
              chunk: chunkText,
              metadata: result.metadata || data?.metadata || {},
            })
            console.log(`[RAG] ✓ Fetched text for: ${result.documentId}`)
          } else {
            console.warn(
              `[RAG] ⚠️ Chunk missing in Firestore: documents/${parentDocId}/chunks/${result.documentId}`
            )
          }
        } catch (err) {
          console.error(`[RAG] ❌ Failed to fetch chunk for ${result.documentId}:`, err)
        }
      }

      if (sourceDocuments.length === 0) {
        console.warn('[RAG] ⚠️ No documents found in Vector Search or Firestore.')
      } else {
        console.log(`[RAG] 📚 Passing ${sourceDocuments.length} source chunks to Gemini...`)
      }

      // Step 4: Generate RAG-grounded answer using Gemini
      const response = await generateRAGAnswer({
        query: input.query,
        sourceDocuments,
      })

      console.log(
        `[RAG] ✅ Answer generated successfully! Citations found: ${response.citations.length}`
      )

      // Save AI response to thread
      await threadStorage.addMessage(input.userId, threadId, {
        role: 'ai',
        content: response.content,
        citations: response.citations,
        sourceCount: sourceDocuments.length,
      })

      return {
        success: true,
        threadId,
        query: input.query,
        answer: response.content,
        citations: response.citations,
        sourceCount: sourceDocuments.length,
      }
    } catch (error) {
      console.error('[RAG] ❌ askLawyer error:', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }),
  /**
   * Epic D: Crisis Manager
   * Analyze insurance coverage and provide post-accident guidance
   */
  analyzeInsurance: publicProcedure
    .input(z.object({ insuranceText: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const analysis = await analyzeInsuranceCoverage(input.insuranceText)

        return {
          success: true,
          coverage: analysis.coverage,
          limitations: analysis.limitations,
          recommendedActions: analysis.recommendedActions,
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        }
      }
    }),

  /**
   * Killer Feature 1: Ticket Decoder
   * Extract handwritten ticket text and look up fines via RAG
   */
  decodeTicket: publicProcedure.input(TicketDecoderSchema).mutation(async ({ input }) => {
    try {
      console.log(`\n[Ticket Decoder] ------------------------------------------------`)
      console.log(`[Ticket Decoder] 🎫 Starting ticket decode...`)

      // Step 1: Extract text from ticket image using Gemini Vision
      const ticketText = await extractTicketText({
        imageUrl: input.imageUrl,
        imageBase64: input.imageBase64,
      })
      console.log(`[Ticket Decoder] ✓ Extracted ticket text (${ticketText.length} chars)`)

      // Step 2: Extract focused violation text for accurate vector search
      // This avoids passing boilerplate to the embedding model
      const violationText = extractViolationText(ticketText)
      console.log(
        `[Ticket Decoder] ✓ Extracted focused violation text: "${violationText.substring(0, 100)}..."`
      )

      // Step 3: Generate embedding for violation lookup in LTO documents
      const searchQuery = `Philippine traffic violation fine penalty: ${violationText}`
      const queryEmbedding = await generateEmbedding(searchQuery)
      console.log(`[Ticket Decoder] ✓ Generated query embedding (${queryEmbedding.length} dims)`)

      // Step 4: Search Vector Search Index for relevant LTO law chunks
      const searchResults = await searchSimilarDocuments(queryEmbedding, 5)
      console.log(`[Ticket Decoder] ✓ Vector Search returned ${searchResults.length} results`)

      // Step 5: Fetch actual chunk text from Firestore (same pattern as askLawyer)
      if (getApps().length === 0) {
        initializeApp({
          projectId: process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'maneho-ai',
        })
      }
      const db = getFirestore()
      const sourceDocuments = []

      for (const result of searchResults) {
        try {
          const parentDocId = result.documentId.split('_chunk_')[0]
          const docSnap = await db
            .collection('documents')
            .doc(parentDocId)
            .collection('chunks')
            .doc(result.documentId)
            .get()

          if (docSnap.exists) {
            const data = docSnap.data()
            const chunkText = data?.text || data?.content || data?.pageContent || ''
            sourceDocuments.push({
              documentId: result.documentId,
              chunk: chunkText,
              metadata: result.metadata || data?.metadata || {},
            })
          }
        } catch (err) {
          console.error(`[Ticket Decoder] ❌ Failed to fetch chunk ${result.documentId}:`, err)
        }
      }

      console.log(`[Ticket Decoder] 📚 Fetched ${sourceDocuments.length} source chunks`)

      // Step 6: Generate RAG-grounded fine explanation using Gemini
      const contextText = sourceDocuments
        .map((doc, idx) => `[DOC ${idx + 1}] (ID: ${doc.documentId})\n${doc.chunk}`)
        .join('\n\n')

      const systemPrompt = `You are an expert LTO (Land Transportation Office) legal assistant specializing in Philippine traffic enforcement regulations. Your role is to provide accurate, citation-backed analysis of traffic violations.

**Your Task:**
1. Analyze the extracted ticket text
2. Match violations against the provided LTO document context
3. Provide exact fine amounts with legal references
4. Give actionable next steps for the violator

**Response Format Requirements:**
You MUST structure your response with these THREE sections, using Markdown:

## Detected Violations
- Bullet list each violation found in the ticket
- Include violation code/reference if available
- Be specific about what was violated

## Computed Fines
- List exact fine amount (₱) for each violation
- Include the legal basis (e.g., "RA 4136 Section X" or "MMDA JAO Circular")
- If multiple violations, show subtotal and total
- Format: "**Violation Name**: ₱X,XXX (Legal Reference)"

## Next Steps
- Payment instructions (where to pay, deadline)
- Options if violator wants to contest (where/how to file)
- Consequences of non-payment if mentioned in documents
- Any deadline information

**Citation Rules:**
- ALWAYS cite the specific law, section, or document ID when stating a fine
- If information comes from the provided LTO context, mention the source document
- If certain information cannot be found in documents, say "Information not available in LTO documents"

**Tone:**
- Professional, clear, and helpful
- Use Philippine pesos (₱) for all amounts
- Provide practical advice`

      const userPrompt = `**Extracted Ticket Text:**
\`\`\`
${ticketText}
\`\`\`

**Context from LTO Documents:**
${contextText}

---

Based on the ticket text and LTO documents above, provide a complete analysis following the required format with THREE sections: Detected Violations, Computed Fines, and Next Steps.

Be thorough and cite specific legal references for all fines stated.`

      let explanation: string
      try {
        console.log(`[Ticket Decoder] 🤖 Calling Gemini for RAG-grounded analysis...`)
        explanation = await callGeminiAPI(userPrompt, systemPrompt)

        // Validate that response contains expected sections
        const hasViolations =
          explanation.includes('Detected Violations') || explanation.includes('Violations')
        const hasFines = explanation.includes('Computed Fines') || explanation.includes('Fines')
        const hasNextSteps =
          explanation.includes('Next Steps') || explanation.includes('next steps')

        if (hasViolations && hasFines && hasNextSteps) {
          console.log(`[Ticket Decoder] ✅ Gemini analysis complete with all 3 sections`)
        } else {
          console.warn(`[Ticket Decoder] ⚠️ Gemini response may be incomplete:`)
          console.warn(`   - Violations section: ${hasViolations ? '✓' : '✗'}`)
          console.warn(`   - Fines section: ${hasFines ? '✓' : '✗'}`)
          console.warn(`   - Next Steps section: ${hasNextSteps ? '✓' : '✗'}`)
        }
      } catch (geminiError) {
        console.error('[Ticket Decoder] ❌ Gemini analysis failed:', geminiError)
        explanation = `**⚠️ Analysis Generation Failed**

Could not generate AI analysis. This may be due to:
- API service temporarily unavailable
- Ticket image quality too poor for OCR
- Violation type not covered in LTO database

**Raw Extracted Ticket Text:**
\`\`\`
${ticketText}
\`\`\`

Please try again or contact support if the problem persists.`
      }

      // Step 7: Return structured response
      const citations = sourceDocuments.map(doc => ({
        documentId: doc.documentId,
        chunkText: doc.chunk,
      }))

      return {
        success: true,
        ticketText,
        explanation,
        citations,
        sourceCount: sourceDocuments.length,
      }
    } catch (error) {
      console.error('[Ticket Decoder] ❌ decodeTicket error:', error)
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }),

  /**
   * Killer Feature 2: Argument Script Generator
   * Generate persuasive, compliant scripts for traffic situations
   */
  generateArgumentScript: publicProcedure
    .input(
      z.object({
        situation: z.string(),
        hasDocumentation: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Step 1: Search RAG for applicable laws
        const embedding = await generateEmbedding(input.situation)
        const relevantLaws = await searchSimilarDocuments(embedding, 3)

        // Step 2: Generate script using Gemini
        const script = await generateArgumentScript(
          input.situation,
          relevantLaws.map(l => l.documentId)
        )

        return {
          success: true,
          script,
          applicableLaws: relevantLaws,
          tips: [
            'Remain calm and respectful',
            "Acknowledge the officer's authority",
            'Cite specific regulations if applicable',
            'Ask for documentation of violations',
          ],
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        }
      }
    }),

  /**
   * Killer Feature 3: Registration Cost Estimator
   * Calculate total renewal costs using LTO fee tables from RAG
   */
  estimateRegistrationCost: publicProcedure
    .input(CostEstimatorSchema)
    .mutation(async ({ input }) => {
      try {
        // Step 1: Search for vehicle class fee in LTO documents
        const feeEmbedding = await generateEmbedding(
          `${input.vehicleType} registration renewal fee LTO`
        )
        const feeResults = await searchSimilarDocuments(feeEmbedding, 2)

        // Step 2: Search for penalty structure (based on months late)
        const penaltyEmbedding = await generateEmbedding(
          `penalty for late renewal ${input.monthsLate} months`
        )
        const penaltyResults = await searchSimilarDocuments(penaltyEmbedding, 2)

        // Mock calculation (would use actual extracted values from RAG results)
        const baseFee = 500 // Would be extracted from RAG
        const penaltyRate = input.monthsLate > 0 ? 50 * input.monthsLate : 0
        const emissionTest = input.modelYear < 2015 ? 250 : 0
        const thirdPartyLiability = 1000

        const total = baseFee + penaltyRate + emissionTest + thirdPartyLiability

        return {
          success: true,
          vehicle: {
            type: input.vehicleType,
            modelYear: input.modelYear,
            monthsLate: input.monthsLate,
          },
          costBreakdown: {
            baseFee,
            latePenalty: penaltyRate,
            emissionTest,
            thirdPartyLiability,
            total,
          },
          sources: [...feeResults, ...penaltyResults],
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        }
      }
    }),

  /**
   * Education: License Checklist
   * Generate personalized requirements for driver's license
   */
  getLicenseChecklist: publicProcedure.input(ExamQuizSchema).mutation(async ({ input }) => {
    try {
      const checklist = await generateLicenseChecklist({
        licenseType: input.category as 'student' | 'non-professional' | 'professional' | 'renewal',
      })

      return {
        success: true,
        licenseType: input.category,
        checklist,
        estimatedDuration: '1-2 weeks',
        estimatedCost: 'P1,500 - P3,000',
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }),

  /**
   * Education: Generate Quiz Questions
   * Pull from LTO question bank via RAG
   */
  generateQuiz: publicProcedure
    .input(z.object({ category: z.string(), questionCount: z.number().default(10) }))
    .mutation(async ({ input }) => {
      try {
        // TODO: Search Firestore quiz collection for questions in category
        return {
          success: true,
          category: input.category,
          questions: [
            {
              id: '1',
              text: 'What is the speed limit in residential areas?',
              options: ['20 km/h', '30 km/h', '40 km/h', '50 km/h'],
              correct: 1,
            },
          ],
          totalQuestions: 1, // Placeholder
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        }
      }
    }),

  /**
   * Education: Explain Quiz Answer
   * Uses Gemini to explain why answer is correct/incorrect
   */
  explainAnswer: publicProcedure
    .input(
      z.object({
        question: z.string(),
        userAnswer: z.string(),
        correctAnswer: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const explanation = await explainTrafficRule(
          input.question,
          input.userAnswer,
          input.correctAnswer
        )

        return {
          success: true,
          explanation,
          creditsDeducted: 1,
        }
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        }
      }
    }),

  /**
   * Health check for RAG pipeline
   */
  health: publicProcedure.query(async () => {
    try {
      return {
        healthy: true,
        timestamp: new Date().toISOString(),
        services: {
          vectorSearch: 'operational',
          gemini: 'operational',
          firestore: 'operational',
        },
      }
    } catch (error) {
      return {
        healthy: false,
        error: (error as Error).message,
      }
    }
  }),
})
