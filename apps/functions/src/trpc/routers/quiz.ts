/**
 * Quiz tRPC Router — Epic C: Quiz & Study
 *
 * Collections:
 *   quiz_questions/{id}         — phased quiz (10 per phase, 6 phases)
 *   mock_exam_questions/{id}    — flat 60-item mock exam (me-001 to me-060)
 *   reviewer_modules/{id}       — study materials
 *
 * Procedures:
 *   getReviewerModules      — fetch all study materials
 *   getQuizPhase            — fetch 10 questions from quiz_questions (phased quiz)
 *   submitQuizPhase         — grade a phased quiz phase
 *   explainAnswer           — AI explanation via Gemini (simple, costs 1 credit)
 *
 *   getExamPhase            — fetch 10 questions from mock_exam_questions (mock exam)
 *   submitPhase             — grade a mock exam phase
 *   explainAnswerWithRAG    — RAG-powered explanation via Firestore vector search + Gemini
 */

import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { getFirestore } from '../../lib/firebase-admin'
import { callGeminiAPI } from '../../utils/gemini'
import { generateGeminiEmbedding } from '../../utils/gemini-embeddings'
import { searchSimilarDocuments } from '../../utils/firestore-search'
import { QuizPhaseSubmitSchema } from '@repo/shared'

// ---------------------------------------------------------------------------
// Internal Firestore types
// ---------------------------------------------------------------------------

interface QuizQuestionDoc {
  id: string
  phaseIndex: number
  domain: string
  questionText: string
  options: string[]
  correctAnswerIndex: number
  staticExplanation: string
}

interface MockExamQuestionDoc {
  id: string
  domain: string
  questionText: string
  options: string[]
  correctAnswerIndex: number
  staticExplanation: string
}

interface ReviewerModuleDoc {
  id: string
  title: string
  domain: string
  content: string
  category: string
}

// ---------------------------------------------------------------------------
// Input schemas for mock exam procedures
// ---------------------------------------------------------------------------

const GetExamPhaseSchema = z.object({
  phaseIndex: z.number().int().min(0).max(5),
})

const SubmitPhaseSchema = z.object({
  phaseIndex: z.number().int().min(0).max(5),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOptionIndex: z.number().int().min(0),
    })
  ),
})

const ExplainAnswerWithRAGSchema = z.object({
  questionText: z.string().min(1),
  userAnswer: z.string().min(1),
  correctAnswer: z.string().min(1),
})

const GenerateStudyMaterialSchema = z.object({
  topicId: z.string().min(1),
  topicTitle: z.string().min(1),
  hiddenPrompt: z.string().min(1),
})

// ---------------------------------------------------------------------------
// Helper: derive the 10 mock exam question IDs for a given phase
// Phase 0 → me-001..me-010, Phase 1 → me-011..me-020, ... Phase 5 → me-051..me-060
// ---------------------------------------------------------------------------

function getMockExamIdsForPhase(phaseIndex: number): string[] {
  const start = phaseIndex * 10 + 1
  return Array.from({ length: 10 }, (_, i) => `me-${String(start + i).padStart(3, '0')}`)
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const quizRouter = router({
  // =========================================================================
  // PHASED QUIZ — quiz_questions collection
  // =========================================================================

  /**
   * Fetch all reviewer/study modules from Firestore.
   */
  getReviewerModules: publicProcedure.query(async () => {
    try {
      const db = getFirestore()
      const snapshot = await db.collection('reviewer_modules').orderBy('domain').get()
      const modules: ReviewerModuleDoc[] = snapshot.docs.map(doc => doc.data() as ReviewerModuleDoc)
      console.log(`[Quiz] ✓ Fetched ${modules.length} reviewer modules`)
      return { success: true, modules }
    } catch (error) {
      console.error('[Quiz] ❌ getReviewerModules error:', error)
      return { success: false, error: (error as Error).message, modules: [] }
    }
  }),

  /**
   * Fetch 10 questions for a specific quiz phase (phased quiz).
   * correctAnswerIndex and staticExplanation are STRIPPED before returning.
   */
  getQuizPhase: publicProcedure
    .input(z.object({ phaseIndex: z.number().int().min(0).max(5) }))
    .query(async ({ input }) => {
      try {
        const db = getFirestore()
        const snapshot = await db
          .collection('quiz_questions')
          .where('phaseIndex', '==', input.phaseIndex)
          .orderBy('id')
          .limit(10)
          .get()

        if (snapshot.empty) {
          return {
            success: false,
            error: `No questions found for phase ${input.phaseIndex}`,
            questions: [],
          }
        }

        const questions = snapshot.docs.map(doc => {
          const data = doc.data() as QuizQuestionDoc
          return {
            id: data.id,
            domain: data.domain,
            questionText: data.questionText,
            options: data.options,
            // correctAnswerIndex intentionally omitted
          }
        })

        console.log(`[Quiz] ✓ Fetched ${questions.length} questions for phase ${input.phaseIndex}`)
        return { success: true, phaseIndex: input.phaseIndex, questions }
      } catch (error) {
        console.error('[Quiz] ❌ getQuizPhase error:', error)
        return { success: false, error: (error as Error).message, questions: [] }
      }
    }),

  /**
   * Grade a completed phased quiz phase.
   */
  submitQuizPhase: publicProcedure.input(QuizPhaseSubmitSchema).mutation(async ({ input }) => {
    try {
      const db = getFirestore()
      const questionIds = input.answers.map(a => a.questionId)

      if (questionIds.length === 0) {
        return { success: false, error: 'No answers submitted', results: [], score: 0 }
      }

      const snapshot = await db.collection('quiz_questions').where('id', 'in', questionIds).get()

      const questionMap = new Map<string, QuizQuestionDoc>()
      snapshot.docs.forEach(doc => {
        const data = doc.data() as QuizQuestionDoc
        questionMap.set(data.id, data)
      })

      let correctCount = 0
      const results = input.answers.map(answer => {
        const question = questionMap.get(answer.questionId)
        if (!question) {
          return {
            questionId: answer.questionId,
            domain: '',
            selectedOptionIndex: answer.selectedOptionIndex,
            correctAnswerIndex: -1,
            isCorrect: false,
            staticExplanation: 'Question not found.',
            questionText: '',
            options: [] as string[],
          }
        }
        const isCorrect = answer.selectedOptionIndex === question.correctAnswerIndex
        if (isCorrect) correctCount++
        return {
          questionId: question.id,
          domain: question.domain,
          questionText: question.questionText,
          options: question.options,
          selectedOptionIndex: answer.selectedOptionIndex,
          correctAnswerIndex: question.correctAnswerIndex,
          isCorrect,
          staticExplanation: question.staticExplanation,
        }
      })

      const score = Math.round((correctCount / results.length) * 100)
      const passed = score >= 80

      console.log(
        `[Quiz] ✓ Phase ${input.phaseIndex} submitted — ${correctCount}/${results.length} correct (${score}%)`
      )
      return {
        success: true,
        phaseIndex: input.phaseIndex,
        score,
        correctCount,
        totalQuestions: results.length,
        passed,
        results,
      }
    } catch (error) {
      console.error('[Quiz] ❌ submitQuizPhase error:', error)
      return { success: false, error: (error as Error).message, results: [], score: 0 }
    }
  }),

  /**
   * Simple Gemini explanation (no RAG). Costs 1 credit.
   */
  explainAnswer: publicProcedure
    .input(
      z.object({
        questionText: z.string().min(1),
        userAnswer: z.string().min(1),
        correctAnswer: z.string().min(1),
        userId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (input.userId) {
          const db = getFirestore()
          const userRef = db.collection('users').doc(input.userId)
          const userSnap = await userRef.get()
          if (userSnap.exists) {
            const userData = userSnap.data() as { credits?: number }
            const currentCredits = userData?.credits ?? 0
            if (currentCredits <= 0) {
              return {
                success: false,
                error: 'Insufficient credits. Please top up to use AI explanations.',
                creditsDeducted: 0,
              }
            }
            await userRef.update({ credits: currentCredits - 1 })
          }
        }

        const systemPrompt = `You are a friendly and encouraging Filipino driving instructor helping a student prepare for the LTO (Land Transportation Office) driver's license examination.

Your goal is to help the student truly UNDERSTAND traffic rules — not just memorize answers.

Guidelines:
- Explain the REASON behind the rule (safety logic, legal basis, or real-world consequence)
- Use simple, conversational Filipino-English (Taglish hints are ok, but keep it mostly English)
- Be encouraging even if the student answered incorrectly
- Keep the explanation concise: 3–5 short paragraphs maximum
- Reference relevant Philippine laws (RA 4136, MMDA, RA 10913, etc.) when applicable`

        const userPrompt = `A student answered a quiz question. Here are the details:

**Question:** ${input.questionText}

**Student's Answer:** ${input.userAnswer}
**Correct Answer:** ${input.correctAnswer}

Please explain:
1. Why "${input.correctAnswer}" is the correct answer
2. The traffic safety principle behind this rule
3. A practical real-world tip the student can remember`

        const explanation = await callGeminiAPI(userPrompt, systemPrompt)
        return {
          success: true,
          explanation,
          creditsDeducted: input.userId ? 1 : 0,
        }
      } catch (error) {
        console.error('[Quiz] ❌ explainAnswer error:', error)
        return { success: false, error: (error as Error).message, creditsDeducted: 0 }
      }
    }),

  // =========================================================================
  // MOCK EXAM — mock_exam_questions collection (me-001 to me-060)
  // =========================================================================

  /**
   * Fetch 10 questions for a mock exam phase (0-indexed).
   *
   * Phase 0 → me-001..me-010 (Traffic Signs)
   * Phase 1 → me-011..me-020 (Traffic Signs continued)
   * Phase 2 → me-021..me-030 (Emergencies)
   * Phase 3 → me-031..me-040 (Emergencies + Rules)
   * Phase 4 → me-041..me-050 (Rules)
   * Phase 5 → me-051..me-060 (Rules)
   *
   * Security: correctAnswerIndex and staticExplanation are STRIPPED before returning.
   */
  getExamPhase: publicProcedure.input(GetExamPhaseSchema).query(async ({ input }) => {
    try {
      const db = getFirestore()
      const ids = getMockExamIdsForPhase(input.phaseIndex)

      // Fetch all 10 documents by their known IDs in parallel
      const docSnapshots = await Promise.all(
        ids.map(id => db.collection('mock_exam_questions').doc(id).get())
      )

      const questions = docSnapshots
        .filter(snap => snap.exists)
        .map(snap => {
          const data = snap.data() as MockExamQuestionDoc
          // Strip answer fields — client must never receive these
          return {
            id: data.id,
            domain: data.domain,
            questionText: data.questionText,
            options: data.options,
            // correctAnswerIndex intentionally omitted
            // staticExplanation intentionally omitted
          }
        })

      if (questions.length === 0) {
        return {
          success: false,
          error: `No mock exam questions found for phase ${input.phaseIndex}. Run the seed script first.`,
          questions: [],
        }
      }

      console.log(
        `[Quiz] ✓ getExamPhase(${input.phaseIndex}) — fetched ${questions.length} questions (${ids[0]}..${ids[ids.length - 1]})`
      )
      return { success: true, phaseIndex: input.phaseIndex, questions }
    } catch (error) {
      console.error('[Quiz] ❌ getExamPhase error:', error)
      return { success: false, error: (error as Error).message, questions: [] }
    }
  }),

  /**
   * Grade a completed mock exam phase.
   *
   * Fetches authoritative answers server-side using the submitted questionIds.
   * Returns per-question results including correctAnswerIndex and staticExplanation.
   */
  submitPhase: publicProcedure.input(SubmitPhaseSchema).mutation(async ({ input }) => {
    try {
      const db = getFirestore()
      const questionIds = input.answers.map(a => a.questionId)

      if (questionIds.length === 0) {
        return { success: false, error: 'No answers submitted', results: [], score: 0 }
      }

      // Fetch all submitted questions by ID in parallel (up to 10, safe for Firestore)
      const docSnapshots = await Promise.all(
        questionIds.map(id => db.collection('mock_exam_questions').doc(id).get())
      )

      const questionMap = new Map<string, MockExamQuestionDoc>()
      docSnapshots.forEach(snap => {
        if (snap.exists) {
          const data = snap.data() as MockExamQuestionDoc
          questionMap.set(data.id, data)
        }
      })

      let correctCount = 0
      const results = input.answers.map(answer => {
        const question = questionMap.get(answer.questionId)

        if (!question) {
          return {
            questionId: answer.questionId,
            domain: '',
            questionText: '',
            options: [] as string[],
            selectedOptionIndex: answer.selectedOptionIndex,
            correctAnswerIndex: -1,
            isCorrect: false,
            staticExplanation: 'Question not found in database.',
          }
        }

        const isCorrect = answer.selectedOptionIndex === question.correctAnswerIndex
        if (isCorrect) correctCount++

        return {
          questionId: question.id,
          domain: question.domain,
          questionText: question.questionText,
          options: question.options,
          selectedOptionIndex: answer.selectedOptionIndex,
          correctAnswerIndex: question.correctAnswerIndex,
          isCorrect,
          staticExplanation: question.staticExplanation,
        }
      })

      const score = Math.round((correctCount / results.length) * 100)
      const passed = score >= 80

      console.log(
        `[Quiz] ✓ submitPhase(${input.phaseIndex}) — ${correctCount}/${results.length} correct (${score}% — ${passed ? 'PASSED' : 'FAILED'})`
      )

      return {
        success: true,
        phaseIndex: input.phaseIndex,
        score,
        correctCount,
        totalQuestions: results.length,
        passed,
        results,
      }
    } catch (error) {
      console.error('[Quiz] ❌ submitPhase error:', error)
      return { success: false, error: (error as Error).message, results: [], score: 0 }
    }
  }),

  /**
   * Dynamically generate study material for a reviewer topic using RAG + Gemini.
   *
   * Flow:
   *   1. Embed the hidden study prompt to find the most relevant LTO law chunks
   *   2. findNearest() — top 6 chunks from the documents collection group
   *   3. Prompt Gemini 2.5 Flash as a study guide author with the retrieved context
   *   4. Return the markdown-formatted study guide
   */
  generateStudyMaterial: publicProcedure
    .input(GenerateStudyMaterialSchema)
    .mutation(async ({ input }) => {
      try {
        const db = getFirestore()

        console.log(`[Quiz/Study] 📚 Generating study material for topic: "${input.topicTitle}"`)

        // Step 1: Embed the study prompt for vector search
        const embedding = await generateGeminiEmbedding(input.hiddenPrompt)
        console.log(`[Quiz/Study] ✓ Embedding generated (${embedding.length} dims)`)

        // Step 2: Firestore native vector search — top 6 closest LTO law chunks
        const searchResults = await searchSimilarDocuments(embedding, 6)
        console.log(`[Quiz/Study] ✓ Vector search returned ${searchResults.length} chunks`)

        // Step 3: Fetch actual chunk text
        const sourceDocuments: Array<{ documentId: string; chunk: string }> = []
        for (const result of searchResults) {
          try {
            const parentDocId = result.documentId.split('_chunk_')[0]
            const chunkSnap = await db
              .collection('documents')
              .doc(parentDocId)
              .collection('chunks')
              .doc(result.documentId)
              .get()

            if (chunkSnap.exists) {
              const data = chunkSnap.data()
              const chunkText: string = data?.text || data?.content || data?.pageContent || ''
              if (chunkText) {
                sourceDocuments.push({ documentId: result.documentId, chunk: chunkText })
              }
            }
          } catch (err) {
            console.error(`[Quiz/Study] ❌ Failed to fetch chunk ${result.documentId}:`, err)
          }
        }

        console.log(`[Quiz/Study] 📄 ${sourceDocuments.length} source chunks retrieved`)

        const contextText =
          sourceDocuments.length > 0
            ? sourceDocuments
                .map((doc, i) => `--- Reference ${i + 1} (${doc.documentId}) ---\n${doc.chunk}`)
                .join('\n\n')
            : 'No specific document references retrieved. Use general knowledge of Philippine traffic regulations (RA 4136, RA 10913, MMDA rules).'

        // Step 4: Prompt Gemini as a study guide author
        const systemPrompt = `You are an expert LTO (Land Transportation Office) exam coach writing concise, exam-focused study guides for Filipino learner drivers.

Your audience is preparing for the official LTO driver's license theory exam. Write in clear, direct English (brief Filipino terms are fine for known phrases).

Formatting rules — strict Markdown:
- Use ## for the main topic heading, ### for sub-sections
- Use bullet lists (- item) for rules, facts, and tips
- Use **bold** for key terms, values (speeds, fines, distances), and law references
- Use > blockquote for important warnings or "remember this" callouts
- Keep the total length to 400–600 words — concise and scannable
- End with a short "### Exam Tips" section (3–5 bullet points) highlighting what's most likely to appear on the LTO exam`

        const userPrompt = `${input.hiddenPrompt}

**Retrieved LTO Document Context:**
${contextText}

---

Using the context above, write a clear, well-structured study guide for the topic "${input.topicTitle}". Follow the formatting rules exactly.`

        console.log(`[Quiz/Study] 🤖 Calling Gemini for study guide generation...`)
        const content = await callGeminiAPI(userPrompt, systemPrompt)
        console.log(`[Quiz/Study] ✅ Study guide generated (${content.length} chars)`)

        return {
          success: true,
          topicId: input.topicId,
          content,
          sourceCount: sourceDocuments.length,
        }
      } catch (error) {
        console.error('[Quiz] ❌ generateStudyMaterial error:', error)
        return {
          success: false,
          error: (error as Error).message,
          topicId: input.topicId,
          content: '',
          sourceCount: 0,
        }
      }
    }),

  /**
   * RAG-powered answer explanation using Firestore Native Vector Search + Gemini.
   *
   * Flow:
   *   1. Embed (questionText + correctAnswer) using Vertex AI text-embedding-004
   *   2. findNearest() on documents/{id}/chunks collection group — top 5 LTO law chunks
   *   3. Fetch chunk text from Firestore
   *   4. Prompt Gemini 2.5 Flash as a driving instructor with the retrieved context
   *   5. Return explanation string
   */
  explainAnswerWithRAG: publicProcedure
    .input(ExplainAnswerWithRAGSchema)
    .mutation(async ({ input }) => {
      try {
        const db = getFirestore()

        // Step 1: Build a focused query embedding from the question + correct answer
        const embeddingQuery = `${input.questionText} ${input.correctAnswer}`
        console.log('[Quiz/RAG] 🔗 Generating embedding for explanation query...')
        const embedding = await generateGeminiEmbedding(embeddingQuery)
        console.log(`[Quiz/RAG] ✓ Embedding generated (${embedding.length} dims)`)

        // Step 2: Firestore native vector search — top 5 closest LTO law chunks
        console.log('[Quiz/RAG] 🔍 Running findNearest() on chunks collection group...')
        const searchResults = await searchSimilarDocuments(embedding, 5)
        console.log(`[Quiz/RAG] ✓ Vector search returned ${searchResults.length} chunks`)

        // Step 3: Fetch the actual text for each matched chunk
        const sourceDocuments: Array<{ documentId: string; chunk: string }> = []

        for (const result of searchResults) {
          try {
            // Chunk IDs follow pattern: "{parentDocId}_chunk_{index}"
            const parentDocId = result.documentId.split('_chunk_')[0]
            const chunkSnap = await db
              .collection('documents')
              .doc(parentDocId)
              .collection('chunks')
              .doc(result.documentId)
              .get()

            if (chunkSnap.exists) {
              const data = chunkSnap.data()
              const chunkText: string = data?.text || data?.content || data?.pageContent || ''
              if (chunkText) {
                sourceDocuments.push({ documentId: result.documentId, chunk: chunkText })
                console.log(`[Quiz/RAG] ✓ Fetched chunk: ${result.documentId}`)
              }
            } else {
              console.warn(`[Quiz/RAG] ⚠️ Chunk not found: ${result.documentId}`)
            }
          } catch (err) {
            console.error(`[Quiz/RAG] ❌ Failed to fetch chunk ${result.documentId}:`, err)
          }
        }

        console.log(`[Quiz/RAG] 📚 ${sourceDocuments.length} source chunks retrieved`)

        // Step 4: Build Gemini prompt with the retrieved LTO law context
        const contextText =
          sourceDocuments.length > 0
            ? sourceDocuments
                .map((doc, i) => `--- Reference ${i + 1} (${doc.documentId}) ---\n${doc.chunk}`)
                .join('\n\n')
            : 'No specific law references retrieved. Rely on general knowledge of Philippine traffic regulations.'

        const systemPrompt = `You are an expert Filipino LTO (Land Transportation Office) driving instructor helping a student understand why they got an exam question wrong.

Your role:
- Explain WHY the correct answer is right using Philippine traffic law (RA 4136, RA 10913, RA 8750, RA 10586, etc.)
- Explain WHY the student's answer is wrong (clearly but kindly)
- Use the retrieved LTO document context as your primary reference
- Be concise, friendly, and educational — 3 to 5 short paragraphs
- Cite specific laws or sections when available in the context`

        const userPrompt = `A student answered an LTO exam question incorrectly:

**Question:** ${input.questionText}

**Student's Answer:** "${input.userAnswer}"
**Correct Answer:** "${input.correctAnswer}"

**Retrieved LTO Law Context:**
${contextText}

---

Using the context above, explain:
1. Why "${input.correctAnswer}" is the correct answer according to Philippine traffic law
2. Why "${input.userAnswer}" is incorrect
3. The key safety principle or legal rule the student should remember`

        // Step 5: Generate the RAG-grounded explanation
        console.log('[Quiz/RAG] 🤖 Calling Gemini for RAG-grounded explanation...')
        const explanation = await callGeminiAPI(userPrompt, systemPrompt)
        console.log(`[Quiz/RAG] ✅ Explanation generated (${explanation.length} chars)`)

        return {
          success: true,
          explanation,
          sourceCount: sourceDocuments.length,
        }
      } catch (error) {
        console.error('[Quiz] ❌ explainAnswerWithRAG error:', error)
        return {
          success: false,
          error: (error as Error).message,
          explanation: '',
          sourceCount: 0,
        }
      }
    }),
})
