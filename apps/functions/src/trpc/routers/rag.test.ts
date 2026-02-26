/**
 * RAG Router Integration Tests
 * Requires live GCP credentials (GCP_PROJECT_ID + GEMINI_API_KEY env vars).
 * These tests are skipped in CI unless credentials are available.
 */

import { describe, it, expect } from 'vitest'
import { ragRouter } from './rag'

const hasCredentials = !!process.env.GCP_PROJECT_ID && !!process.env.GEMINI_API_KEY

describe.skipIf(!hasCredentials)('RAG Router', () => {
  it('askLawyer should return answer with citations', async () => {
    const caller = ragRouter.createCaller({})

    const result = await caller.askLawyer({
      query: 'What is the penalty for not renewing my driver license on time?',
      userId: 'test-user',
    })

    console.log('Ask Lawyer Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.query).toBe('What is the penalty for not renewing my driver license on time?')
    expect(result.answer).toBeDefined()
  })

  it('estimateRegistrationCost should return cost breakdown', async () => {
    const caller = ragRouter.createCaller({})

    const result = await caller.estimateRegistrationCost({
      vehicleType: 'car',
      modelYear: 2018,
      monthsLate: 3,
    })

    console.log('Cost Estimate Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.costBreakdown).toBeDefined()
    expect(result.costBreakdown?.total).toBeGreaterThan(0)
  })

  it('decodeTicket should extract ticket information', async () => {
    const caller = ragRouter.createCaller({})

    const result = await caller.decodeTicket({
      imageUrl: 'https://firebasestorage.com/user-uploads/test-ticket.jpg',
    })

    console.log('Ticket Decoder Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.explanation).toBeDefined()
  })

  it('generateArgumentScript should create a script', async () => {
    const caller = ragRouter.createCaller({})

    const result = await caller.generateArgumentScript({
      situation: 'Officer claims I was speeding in a school zone at 8 PM',
      hasDocumentation: true,
    })

    console.log('Script Generator Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.script).toBeDefined()
    expect(result.tips).toBeDefined()
  })

  it('analyzeInsurance should parse insurance coverage', async () => {
    const caller = ragRouter.createCaller({})

    const result = await caller.analyzeInsurance({
      insuranceText: `
        Insurance Policy Summary

        Coverage Types:
        - Comprehensive: P500,000 limit
        - Third-party liability: P1,000,000 limit
        - Acts of nature: Covered with 10% deductible

        Exclusions:
        - Racing or motorsports use
        - Intentional damage
        - Use by unlicensed drivers
      `,
    })

    console.log('Insurance Analysis Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.coverage).toBeDefined()
  })

  it('getLicenseChecklist should return requirements', async () => {
    const caller = ragRouter.createCaller({})

    const result = await caller.getLicenseChecklist({
      category: 'non-professional',
    })

    console.log('License Checklist Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.checklist).toBeDefined()
    expect(Array.isArray(result.checklist)).toBe(true)
  })

  it('generateQuiz should return quiz questions', async () => {
    const caller = ragRouter.createCaller({})

    const result = await caller.generateQuiz({
      category: 'non-professional',
      questionCount: 5,
    })

    console.log('Quiz Generator Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.questions).toBeDefined()
  })

  it('explainAnswer should provide explanation', async () => {
    const caller = ragRouter.createCaller({})

    const result = await caller.explainAnswer({
      question: 'What is the speed limit in residential areas?',
      userAnswer: '50 km/h',
      correctAnswer: '30 km/h',
    })

    console.log('Explain Answer Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.success).toBe(true)
    expect(result.explanation).toBeDefined()
    expect(result.creditsDeducted).toBe(1)
  })

  it('health should return system status', async () => {
    const caller = ragRouter.createCaller({})

    const result = await caller.health()

    console.log('Health Check Result:', JSON.stringify(result, null, 2))

    expect(result).toBeDefined()
    expect(result.healthy).toBeDefined()
    expect(result.services).toBeDefined()
  })
})
