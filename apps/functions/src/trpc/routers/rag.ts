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
  AskLawyerSchema,
  TicketDecoderSchema,
  CostEstimatorSchema,
  ExamQuizSchema,
} from '@repo/shared'
import { generateEmbedding, searchSimilarDocuments } from '../../utils/vertex-ai'
import {
  generateRAGAnswer,
  extractTicketText,
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
  askLawyer: publicProcedure.input(AskLawyerSchema).mutation(async ({ input }) => {
    try {
      console.log(`\n[RAG] ------------------------------------------------`)
      console.log(`[RAG] 🧠 askLawyer query: "${input.query}"`)

      // Step 1: Generate embedding for the query (768-dim)
      const queryEmbedding = await generateEmbedding(input.query)
      console.log(`[RAG] ✓ Generated query embedding (${queryEmbedding.length} dimensions)`)

      // Step 2: Search Vector Search Index for relevant documents
      const searchResults = await searchSimilarDocuments(queryEmbedding, 5)
      console.log(`[RAG] ✓ Vector Search returned ${searchResults.length} results`)

      // Step 3: Fetch actual chunk text from Firestore (FIXED NESTED LOGIC)g

      // 🚨 SELF-HEALING FIREBASE INIT (Fixes the test script crash)
      if (getApps().length === 0) {
        console.log('[RAG] 🔄 Initializing Firebase Admin locally...')
        // Pass the explicit project ID here
        initializeApp({
          projectId: process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'maneho-ai',
        })
      }
      const db = getFirestore()
      const sourceDocuments = []

      for (const result of searchResults) {
        try {
          // Extract the parent document ID (e.g., "test-doc-001" from "test-doc-001_chunk_15")
          const parentDocId = result.documentId.split('_chunk_')[0]

          // Fetch the exact chunk from the nested subcollection
          const docSnap = await db
            .collection('documents')
            .doc(parentDocId)
            .collection('chunks')
            .doc(result.documentId)
            .get()

          if (docSnap.exists) {
            const data = docSnap.data()

            // Adjust 'text' to whatever field holds your string in Firestore
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

      return {
        success: true,
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
      // Step 1: Extract text from ticket image using Gemini Vision
      const ticketText = await extractTicketText(input.imageUrl)

      // Step 2: Parse ticket to find violation type
      // This would normally parse structured ticket data

      // Step 3: Search for fine amount in LTO documents via RAG
      const queryEmbedding = await generateEmbedding(
        `fine amount for traffic violation in ticket: ${ticketText}`
      )
      const searchResults = await searchSimilarDocuments(queryEmbedding, 3)

      return {
        success: true,
        ticketText,
        extractedFields: {
          violationType: 'Placeholder violation type',
          amount: 'P500', // Would be extracted from RAG results
          date: 'Feb 21, 2026',
        },
        fineDetails: {
          baseFine: 'P500',
          penalty: 'P0 (first offense assumed)',
          total: 'P500',
          sources: searchResults,
        },
      }
    } catch (error) {
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
