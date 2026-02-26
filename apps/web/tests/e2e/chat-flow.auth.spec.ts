/**
 * Ask Lawyer — Authenticated Chat-Flow E2E Tests
 *
 * These tests run with a stored auth session (produced by auth.setup.ts).
 * They verify the core RAG chat UX:
 *   - Page structure renders correctly
 *   - Typing and submitting a message shows a loading state
 *   - A response eventually appears (with a generous timeout for AI latency)
 *   - Thread is persisted in the sidebar
 *
 * NOTE: These tests call the live backend. Run them with:
 *   PLAYWRIGHT_BASE_URL=https://your-staging-url pnpm e2e
 * or against the local dev server with a real Firebase project configured.
 */

import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Ask Lawyer page
// ---------------------------------------------------------------------------

test.describe('Ask Lawyer — authenticated chat', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ask-lawyer')
    // Confirm we're on the right page
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('renders the chat input area', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /ask|question|message/i })
    await expect(input).toBeVisible()
  })

  test('send button is initially disabled for empty input', async ({ page }) => {
    const sendBtn = page.getByRole('button', { name: /send|ask|submit/i })
    await expect(sendBtn).toBeDisabled()
  })

  test('send button enables when user types a message', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /ask|question|message/i })
    await input.fill('What is reckless driving?')
    const sendBtn = page.getByRole('button', { name: /send|ask|submit/i })
    await expect(sendBtn).toBeEnabled()
  })

  test('submitting a message shows a loading indicator', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /ask|question|message/i })
    await input.fill('What is the penalty for not wearing a seatbelt?')

    const sendBtn = page.getByRole('button', { name: /send|ask|submit/i })
    await sendBtn.click()

    // A loading spinner or "thinking" indicator should appear
    const loader = page.getByRole('status').or(page.locator('[aria-busy="true"]')).first()
    await expect(loader).toBeVisible({ timeout: 5_000 })
  })

  test('AI response appears after submission', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /ask|question|message/i })
    await input.fill('What is the speed limit in a residential area in the Philippines?')

    await page.getByRole('button', { name: /send|ask|submit/i }).click()

    // Wait for the AI response — generous timeout for RAG pipeline latency
    const response = page.locator('[data-testid="ai-message"]').first()
    await expect(response).toBeVisible({ timeout: 30_000 })
    const text = await response.textContent()
    expect(text!.trim().length).toBeGreaterThan(10)
  })

  test('user message appears in the chat log', async ({ page }) => {
    const userMsg = 'How do I renew my driver license in the Philippines?'
    const input = page.getByRole('textbox', { name: /ask|question|message/i })
    await input.fill(userMsg)
    await page.getByRole('button', { name: /send|ask|submit/i }).click()

    await expect(page.getByText(userMsg)).toBeVisible()
  })

  test('keyboard shortcut Ctrl+Enter submits the message', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /ask|question|message/i })
    await input.fill('Tell me about LTO fees')
    await input.press('Control+Enter')

    // The input should be cleared after submission
    await expect(input).toHaveValue('', { timeout: 3_000 })
  })
})

// ---------------------------------------------------------------------------
// Navigation between features
// ---------------------------------------------------------------------------

test.describe('Dashboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('can navigate to Ticket Decoder', async ({ page }) => {
    await page.getByRole('link', { name: /ticket decoder/i }).click()
    await expect(page).toHaveURL(/\/ticket-decoder/)
  })

  test('can navigate to Cost Estimator', async ({ page }) => {
    await page.getByRole('link', { name: /cost estimator/i }).click()
    await expect(page).toHaveURL(/\/cost-estimator/)
  })

  test('can navigate to Quiz Hub', async ({ page }) => {
    await page.getByRole('link', { name: /quiz/i }).first().click()
    await expect(page).toHaveURL(/\/quiz/)
  })
})
