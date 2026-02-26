/**
 * Seed Script: LTO Mock Exam Questions
 * Uploads 60 questions to the `mock_exam_questions` Firestore collection.
 *
 * Usage:
 *   pnpm seed:exam
 *   (or) pnpm tsx src/scripts/seed-exam.ts
 *
 * Collection: mock_exam_questions/{questionId}
 * Schema: { id, domain, questionText, options, correctAnswerIndex, staticExplanation }
 */

import * as dotenv from 'dotenv'
dotenv.config()

import { getFirestore } from '../lib/firebase-admin'
import { LTO_MOCK_EXAM_QUESTIONS } from '../data/lto-mock-exam'

const COLLECTION = 'mock_exam_questions'

async function seedMockExam(): Promise<void> {
  const db = getFirestore()

  console.log(`[seed-exam] Starting upload to '${COLLECTION}'...`)
  console.log(`[seed-exam] Total questions: ${LTO_MOCK_EXAM_QUESTIONS.length}`)

  // Count by domain for a useful summary
  const domainCounts: Record<string, number> = {}
  for (const q of LTO_MOCK_EXAM_QUESTIONS) {
    domainCounts[q.domain] = (domainCounts[q.domain] ?? 0) + 1
  }
  console.log('[seed-exam] Distribution:', domainCounts)
  console.log('')

  let uploaded = 0
  let failed = 0

  for (const question of LTO_MOCK_EXAM_QUESTIONS) {
    try {
      await db.collection(COLLECTION).doc(question.id).set(question)
      console.log(`[seed-exam]  ✓ ${question.id} — ${question.domain}`)
      uploaded++
    } catch (err) {
      console.error(`[seed-exam]  ✗ ${question.id} — FAILED:`, (err as Error).message)
      failed++
    }
  }

  console.log('')
  console.log('─'.repeat(50))
  console.log(`[seed-exam] ✅ Done!`)
  console.log(`[seed-exam]    Uploaded : ${uploaded}`)
  console.log(`[seed-exam]    Failed   : ${failed}`)
  console.log(`[seed-exam]    Collection: ${COLLECTION}`)

  if (failed > 0) {
    process.exit(1)
  }
}

seedMockExam().catch(err => {
  console.error('[seed-exam] ❌ Fatal error:', err)
  process.exit(1)
})
