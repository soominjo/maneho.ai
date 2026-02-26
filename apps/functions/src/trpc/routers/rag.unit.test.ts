/**
 * RAG Router Unit Tests
 *
 * Tests tRPC procedures in ragRouter with ALL external services mocked:
 *   - Gemini embedding API
 *   - Firestore vector search
 *   - Gemini generative API (generateRAGAnswer, callGeminiAPI, etc.)
 *   - Firebase Admin (getApps, initializeApp, getFirestore)
 *   - Thread storage
 *
 * No real network calls. Tests focus on:
 *   ✔ Procedure return shapes
 *   ✔ Business logic (cost calculation, out-of-domain detection)
 *   ✔ Error handling / graceful failure
 *   ✔ Data flow through the pipeline
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks (hoisted — must appear before any imports that use them)
// ---------------------------------------------------------------------------

vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn(() => [{ name: '[DEFAULT]' }]), // Pretend app is already initialised
  initializeApp: vi.fn(),
}))

// Mock the Firestore from firebase-admin/firestore used inside the RAG procedures
// (the procedure calls getFirestore() from 'firebase-admin/firestore' directly)
const mockChunkDocGet = vi.fn()
const mockChunkDoc = vi.fn(() => ({ get: mockChunkDocGet }))
const mockChunksCollection = vi.fn(() => ({ doc: mockChunkDoc }))
const mockParentDoc = vi.fn(() => ({ collection: mockChunksCollection }))
const mockDocumentsCollection = vi.fn(() => ({ doc: mockParentDoc }))
const mockFirestoreDb = { collection: mockDocumentsCollection }

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn(() => mockFirestoreDb),
  FieldValue: { vector: vi.fn((arr: number[]) => arr) },
}))

vi.mock('../../lib/thread-storage', () => ({
  createThread: vi.fn(() => Promise.resolve({ id: 'thread-new-001' })),
  addMessage: vi.fn(() => Promise.resolve()),
}))

vi.mock('../../utils/gemini-embeddings', () => ({
  generateGeminiEmbedding: vi.fn(() => Promise.resolve(Array(768).fill(0.1))),
}))

vi.mock('../../utils/firestore-search', () => ({
  searchSimilarDocuments: vi.fn(() => Promise.resolve([])),
}))

vi.mock('../../utils/gemini', () => ({
  generateRAGAnswer: vi.fn(() =>
    Promise.resolve({
      content: 'The fine for reckless driving is ₱2,000.',
      citations: [{ documentId: 'lto-memo-001', chunkText: 'Section 3. Penalties...' }],
    })
  ),
  callGeminiAPI: vi.fn(() => Promise.resolve('Mocked Gemini response')),
  extractTicketText: vi.fn(() => Promise.resolve('Violation: No seatbelt')),
  extractViolationText: vi.fn((text: string) => text),
  generateArgumentScript: vi.fn(() => Promise.resolve('Here is your argument script...')),
  analyzeInsuranceCoverage: vi.fn(() =>
    Promise.resolve({
      coverage: [{ type: 'Comprehensive', limit: '₱500,000' }],
      limitations: ['Racing use excluded'],
      recommendedActions: ['File claim within 7 days'],
    })
  ),
  explainTrafficRule: vi.fn(() => Promise.resolve('The correct answer is 30 km/h because...')),
  generateLicenseChecklist: vi.fn(() =>
    Promise.resolve([
      { item: 'Valid ID', required: true },
      { item: 'Medical certificate', required: true },
    ])
  ),
}))

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { ragRouter } from './rag'
import { searchSimilarDocuments } from '../../utils/firestore-search'
import { generateGeminiEmbedding } from '../../utils/gemini-embeddings'
import {
  generateRAGAnswer,
  analyzeInsuranceCoverage,
  explainTrafficRule,
  generateLicenseChecklist,
  generateArgumentScript,
} from '../../utils/gemini'
import * as threadStorage from '../../lib/thread-storage'

// ---------------------------------------------------------------------------
// Shared caller
// ---------------------------------------------------------------------------

const caller = ragRouter.createCaller({} as never)

// ---------------------------------------------------------------------------
// health
// ---------------------------------------------------------------------------

describe('rag.health', () => {
  it('returns healthy=true', async () => {
    const result = await caller.health()
    expect(result.healthy).toBe(true)
  })

  it('returns a valid ISO timestamp', async () => {
    const result = await caller.health()
    expect(() => new Date(result.timestamp!)).not.toThrow()
  })

  it('reports all three services as operational', async () => {
    const result = await caller.health()
    expect(result.services).toMatchObject({
      vectorSearch: 'operational',
      gemini: 'operational',
      firestore: 'operational',
    })
  })
})

// ---------------------------------------------------------------------------
// generateQuiz
// ---------------------------------------------------------------------------

describe('rag.generateQuiz', () => {
  it('returns success=true', async () => {
    const result = await caller.generateQuiz({ category: 'non-professional', questionCount: 5 })
    expect(result.success).toBe(true)
  })

  it('echoes the requested category', async () => {
    const result = await caller.generateQuiz({ category: 'professional', questionCount: 5 })
    expect(result.category).toBe('professional')
  })

  it('returns a questions array', async () => {
    const result = await caller.generateQuiz({ category: 'student', questionCount: 5 })
    expect(Array.isArray(result.questions)).toBe(true)
  })

  it('returns totalQuestions field', async () => {
    const result = await caller.generateQuiz({ category: 'renewal', questionCount: 5 })
    expect(typeof result.totalQuestions).toBe('number')
  })
})

// ---------------------------------------------------------------------------
// estimateRegistrationCost — business logic
// ---------------------------------------------------------------------------

describe('rag.estimateRegistrationCost — fee calculation logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Restore default mocks after clearAllMocks
    vi.mocked(generateGeminiEmbedding).mockResolvedValue(Array(768).fill(0.1))
    vi.mocked(searchSimilarDocuments).mockResolvedValue([])
  })

  it('computes correct total: no late months, 2020 car', async () => {
    const result = await caller.estimateRegistrationCost({
      vehicleType: 'car',
      modelYear: 2020,
      monthsLate: 0,
    })
    // baseFee=500 + latePenalty=0 + emissionTest=0 + TPL=1000
    expect(result.success).toBe(true)
    expect(result.costBreakdown!.total).toBe(1500)
  })

  it('applies late penalty: 50 * monthsLate', async () => {
    const result = await caller.estimateRegistrationCost({
      vehicleType: 'car',
      modelYear: 2020,
      monthsLate: 3,
    })
    expect(result.costBreakdown!.latePenalty).toBe(150)
    // baseFee=500 + latePenalty=150 + emission=0 + TPL=1000 = 1650
    expect(result.costBreakdown!.total).toBe(1650)
  })

  it('adds emission test (₱250) for vehicles older than 2015', async () => {
    const result = await caller.estimateRegistrationCost({
      vehicleType: 'car',
      modelYear: 2014,
      monthsLate: 0,
    })
    expect(result.costBreakdown!.emissionTest).toBe(250)
    // baseFee=500 + latePenalty=0 + emission=250 + TPL=1000 = 1750
    expect(result.costBreakdown!.total).toBe(1750)
  })

  it('does NOT add emission test for 2015 or newer', async () => {
    const result = await caller.estimateRegistrationCost({
      vehicleType: 'motorcycle',
      modelYear: 2015,
      monthsLate: 0,
    })
    expect(result.costBreakdown!.emissionTest).toBe(0)
  })

  it('combines all costs correctly: 2010 car, 6 months late', async () => {
    const result = await caller.estimateRegistrationCost({
      vehicleType: 'car',
      modelYear: 2010,
      monthsLate: 6,
    })
    // baseFee=500, penalty=300, emission=250, TPL=1000 → 2050
    expect(result.costBreakdown!.total).toBe(2050)
  })

  it('always includes thirdPartyLiability of ₱1000', async () => {
    const result = await caller.estimateRegistrationCost({
      vehicleType: 'truck',
      modelYear: 2022,
      monthsLate: 0,
    })
    expect(result.costBreakdown!.thirdPartyLiability).toBe(1000)
  })

  it('echoes vehicle info in result', async () => {
    const result = await caller.estimateRegistrationCost({
      vehicleType: 'bus',
      modelYear: 2019,
      monthsLate: 2,
    })
    expect(result.vehicle).toMatchObject({
      type: 'bus',
      modelYear: 2019,
      monthsLate: 2,
    })
  })

  it('returns success=false when embedding generation throws', async () => {
    vi.mocked(generateGeminiEmbedding).mockRejectedValue(new Error('Gemini down'))
    const result = await caller.estimateRegistrationCost({
      vehicleType: 'car',
      modelYear: 2020,
      monthsLate: 0,
    })
    expect(result.success).toBe(false)
    expect((result as { error?: string }).error).toMatch(/Gemini down/)
  })
})

// ---------------------------------------------------------------------------
// askLawyer — pipeline and out-of-domain detection
// ---------------------------------------------------------------------------

describe('rag.askLawyer', () => {
  const validInput = { query: 'What is the penalty for reckless driving?', userId: 'user-001' }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(generateGeminiEmbedding).mockResolvedValue(Array(768).fill(0.1))
    vi.mocked(searchSimilarDocuments).mockResolvedValue([])
    vi.mocked(generateRAGAnswer).mockResolvedValue({
      content: 'The fine for reckless driving is ₱2,000.',
      citations: [{ documentId: 'doc-001', chunkText: 'fine...' }],
    })
    vi.mocked(threadStorage.createThread).mockResolvedValue({ id: 'thread-001' } as never)
    vi.mocked(threadStorage.addMessage).mockResolvedValue({
      id: 'msg-001',
      createdAt: new Date().toISOString(),
    })
    mockChunkDocGet.mockResolvedValue({ exists: false })
  })

  it('returns success=true for a valid query', async () => {
    const result = await caller.askLawyer(validInput)
    expect(result.success).toBe(true)
  })

  it('echoes the query in the response', async () => {
    const result = await caller.askLawyer(validInput)
    expect(result.query).toBe(validInput.query)
  })

  it('returns an answer string', async () => {
    const result = await caller.askLawyer(validInput)
    expect(typeof result.answer).toBe('string')
    expect(result.answer!.length).toBeGreaterThan(0)
  })

  it('creates a new thread when no threadId is provided', async () => {
    await caller.askLawyer(validInput)
    expect(threadStorage.createThread).toHaveBeenCalledWith('user-001')
  })

  it('reuses an existing thread when threadId is provided', async () => {
    await caller.askLawyer({ ...validInput, threadId: 'existing-thread' })
    expect(threadStorage.createThread).not.toHaveBeenCalled()
  })

  it('returns the threadId in the response', async () => {
    const result = await caller.askLawyer(validInput)
    expect(result.threadId).toBeDefined()
  })

  it('calls generateGeminiEmbedding with the query text', async () => {
    await caller.askLawyer(validInput)
    expect(generateGeminiEmbedding).toHaveBeenCalledWith(validInput.query)
  })

  it('clears citations when response is out-of-domain', async () => {
    vi.mocked(generateRAGAnswer).mockResolvedValue({
      content: "I don't have information about this in the LTO documents.",
      citations: [{ documentId: 'doc-001', chunkText: 'irrelevant' }],
    })

    const result = await caller.askLawyer(validInput)
    expect(result.citations).toEqual([])
    expect(result.sourceCount).toBe(0)
  })

  it('preserves citations for in-domain responses', async () => {
    vi.mocked(generateRAGAnswer).mockResolvedValue({
      content: 'The fine is ₱2,000 per RA 4136.',
      citations: [{ documentId: 'doc-001', chunkText: 'RA 4136 Section 7...' }],
    })

    const result = await caller.askLawyer(validInput)
    expect(result.citations!.length).toBeGreaterThan(0)
  })

  it('returns success=false when embedding fails', async () => {
    vi.mocked(generateGeminiEmbedding).mockRejectedValue(new Error('Quota exceeded'))
    const result = await caller.askLawyer(validInput)
    expect(result.success).toBe(false)
    expect((result as { error?: string }).error).toMatch(/Quota exceeded/)
  })

  it('saves user message and AI response to thread', async () => {
    await caller.askLawyer(validInput)
    expect(threadStorage.addMessage).toHaveBeenCalledTimes(2)
  })
})

// ---------------------------------------------------------------------------
// analyzeInsurance
// ---------------------------------------------------------------------------

describe('rag.analyzeInsurance', () => {
  const policyText = 'Comprehensive: ₱500,000. Third-party: ₱1,000,000.'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(analyzeInsuranceCoverage).mockResolvedValue({
      coverage: ['Comprehensive: ₱500,000'],
      limitations: [],
      recommendedActions: [],
    })
  })

  it('returns success=true', async () => {
    const result = await caller.analyzeInsurance({ insuranceText: policyText })
    expect(result.success).toBe(true)
  })

  it('returns coverage from the Gemini analysis', async () => {
    const result = await caller.analyzeInsurance({ insuranceText: policyText })
    expect(result.coverage).toBeDefined()
    expect(Array.isArray(result.coverage)).toBe(true)
  })

  it('passes insurance text to analyzeInsuranceCoverage', async () => {
    await caller.analyzeInsurance({ insuranceText: policyText })
    expect(analyzeInsuranceCoverage).toHaveBeenCalledWith(policyText)
  })

  it('returns success=false when Gemini throws', async () => {
    vi.mocked(analyzeInsuranceCoverage).mockRejectedValueOnce(new Error('API error'))
    const result = await caller.analyzeInsurance({ insuranceText: policyText })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// explainAnswer
// ---------------------------------------------------------------------------

describe('rag.explainAnswer', () => {
  const input = {
    question: 'What is the speed limit in a school zone?',
    userAnswer: '50 km/h',
    correctAnswer: '30 km/h',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(explainTrafficRule).mockResolvedValue('30 km/h is correct because school zones...')
  })

  it('returns success=true', async () => {
    const result = await caller.explainAnswer(input)
    expect(result.success).toBe(true)
  })

  it('returns an explanation string', async () => {
    const result = await caller.explainAnswer(input)
    expect(typeof result.explanation).toBe('string')
  })

  it('deducts 1 credit per explanation', async () => {
    const result = await caller.explainAnswer(input)
    expect(result.creditsDeducted).toBe(1)
  })

  it('passes all three fields to explainTrafficRule', async () => {
    await caller.explainAnswer(input)
    expect(explainTrafficRule).toHaveBeenCalledWith(
      input.question,
      input.userAnswer,
      input.correctAnswer
    )
  })

  it('returns success=false when Gemini throws', async () => {
    vi.mocked(explainTrafficRule).mockRejectedValueOnce(new Error('Model overloaded'))
    const result = await caller.explainAnswer(input)
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getLicenseChecklist
// ---------------------------------------------------------------------------

describe('rag.getLicenseChecklist', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(generateLicenseChecklist).mockResolvedValue([
      'Valid government-issued ID',
      'Medical certificate',
    ])
  })

  it('returns success=true', async () => {
    const result = await caller.getLicenseChecklist({ category: 'non-professional' })
    expect(result.success).toBe(true)
  })

  it('returns a checklist array', async () => {
    const result = await caller.getLicenseChecklist({ category: 'student' })
    expect(Array.isArray(result.checklist)).toBe(true)
  })

  it('echoes the license category', async () => {
    const result = await caller.getLicenseChecklist({ category: 'professional' })
    expect(result.licenseType).toBe('professional')
  })

  it('returns estimatedDuration and estimatedCost', async () => {
    const result = await caller.getLicenseChecklist({ category: 'renewal' })
    expect(result.estimatedDuration).toBeDefined()
    expect(result.estimatedCost).toBeDefined()
  })

  it('returns success=false when Gemini throws', async () => {
    vi.mocked(generateLicenseChecklist).mockRejectedValueOnce(new Error('Timeout'))
    const result = await caller.getLicenseChecklist({ category: 'non-professional' })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// generateArgumentScript
// ---------------------------------------------------------------------------

describe('rag.generateArgumentScript', () => {
  const situation = 'Officer claims I ran a red light at 10 PM with no traffic'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(generateGeminiEmbedding).mockResolvedValue(Array(768).fill(0.1))
    vi.mocked(searchSimilarDocuments).mockResolvedValue([])
    vi.mocked(generateArgumentScript).mockResolvedValue('Politely state your case...')
  })

  it('returns success=true', async () => {
    const result = await caller.generateArgumentScript({ situation })
    expect(result.success).toBe(true)
  })

  it('returns a script string', async () => {
    const result = await caller.generateArgumentScript({ situation })
    expect(typeof result.script).toBe('string')
  })

  it('returns the standard tips array', async () => {
    const result = await caller.generateArgumentScript({ situation })
    expect(Array.isArray(result.tips)).toBe(true)
    expect(result.tips!.length).toBeGreaterThan(0)
  })

  it('returns success=false when embedding throws', async () => {
    vi.mocked(generateGeminiEmbedding).mockRejectedValueOnce(new Error('embedding error'))
    const result = await caller.generateArgumentScript({ situation })
    expect(result.success).toBe(false)
  })
})
