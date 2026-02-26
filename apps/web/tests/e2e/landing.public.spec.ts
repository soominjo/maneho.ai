/**
 * Landing Page — Public (unauthenticated) E2E tests
 *
 * These run without any stored auth state and cover the
 * marketing / onboarding funnel that anonymous visitors see.
 */

import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Landing page
// ---------------------------------------------------------------------------

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders the page title in the document', async ({ page }) => {
    await expect(page).toHaveTitle(/Maneho/i)
  })

  test('displays the Maneho AI logo image', async ({ page }) => {
    const logo = page.getByRole('img', { name: /maneho ai logo/i })
    await expect(logo).toBeVisible()
  })

  test('shows a primary call-to-action button', async ({ page }) => {
    // Any "Get started", "Try now", or "Sign up" CTA
    const cta = page.getByRole('button', { name: /get started|try|sign up|start/i }).first()
    await expect(cta).toBeVisible()
  })

  test('public navbar is visible to unauthenticated visitors', async ({ page }) => {
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
  })

  test('sign-in link navigates to /login', async ({ page }) => {
    const signInLink = page.getByRole('link', { name: /sign in|log in/i }).first()
    await signInLink.click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('footer shows copyright notice', async ({ page }) => {
    await expect(page.getByText(/Maneho AI/i)).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Sign-in page
// ---------------------------------------------------------------------------

test.describe('Sign-in page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('renders email and password fields', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('submit button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible()
  })

  test('shows validation error for empty submission', async ({ page }) => {
    await page.getByRole('button', { name: /sign in|log in/i }).click()
    // Browser-native or react-hook-form validation should surface an error
    const emailInput = page.getByLabel(/email/i)
    const validationMsg = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMsg.length).toBeGreaterThan(0)
  })

  test('shows error for invalid email format', async ({ page }) => {
    await page.getByLabel(/email/i).fill('not-an-email')
    await page.getByLabel(/password/i).fill('somepassword')
    await page.getByRole('button', { name: /sign in|log in/i }).click()
    const emailInput = page.getByLabel(/email/i)
    const validationMsg = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMsg.length).toBeGreaterThan(0)
  })

  test('link to register page is visible', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /register|sign up|create account/i })
    await expect(registerLink).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Protected route redirect
// ---------------------------------------------------------------------------

test.describe('Protected routes', () => {
  test('unauthenticated user is redirected from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user is redirected from /ask-lawyer to /login', async ({ page }) => {
    await page.goto('/ask-lawyer')
    await expect(page).toHaveURL(/\/login/)
  })
})

// ---------------------------------------------------------------------------
// 404 page
// ---------------------------------------------------------------------------

test.describe('404 Not Found', () => {
  test('shows a not-found message for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz')
    // The app renders a NotFoundPage — check for common text
    await expect(page.getByText(/not found|page not found|404/i).first()).toBeVisible()
  })
})
