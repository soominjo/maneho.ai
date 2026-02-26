/**
 * Authentication Setup
 *
 * Runs once before all auth-gated test suites.
 * Performs a real sign-in via the UI and saves the browser storage state
 * to `tests/e2e/.auth/user.json` so authenticated specs can skip login.
 *
 * Requires environment variables:
 *   E2E_EMAIL    — a pre-created Firebase test account email
 *   E2E_PASSWORD — the account password
 *
 * Create the account once via the Firebase console or with the Firebase
 * Admin SDK in a one-off script. NEVER commit real credentials.
 */

import { test as setup, expect } from '@playwright/test'
import path from 'path'

const AUTH_FILE = path.join(__dirname, '.auth/user.json')

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_EMAIL
  const password = process.env.E2E_PASSWORD

  if (!email || !password) {
    console.warn(
      '[auth.setup] E2E_EMAIL / E2E_PASSWORD not set — skipping auth setup.\n' +
        'Authenticated tests will be skipped or will fail.'
    )
    // Write an empty state so Playwright does not crash
    await page.context().storageState({ path: AUTH_FILE })
    return
  }

  // ── Navigate to sign-in page ──────────────────────────────────────────────
  await page.goto('/login')

  // ── Fill credentials ──────────────────────────────────────────────────────
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in|log in/i }).click()

  // ── Wait for redirect to dashboard ───────────────────────────────────────
  await expect(page).toHaveURL(/\/(dashboard|ask-lawyer)/, { timeout: 15_000 })

  // ── Persist auth state for subsequent test runs ───────────────────────────
  await page.context().storageState({ path: AUTH_FILE })
})
