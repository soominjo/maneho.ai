/**
 * App Router — route-based code splitting via React.lazy()
 *
 * Every page component is loaded lazily so Vite emits a separate chunk
 * per route. The shared layouts (RootLayout, DashboardLayout) and the
 * tiny ProtectedRoute guard are kept as eager imports — they are needed
 * on every navigation and add negligible weight.
 *
 * Each route element is wrapped in <Suspense fallback={<PageLoader />}> via
 * the `s()` helper, so users see a spinner instead of a blank screen while
 * the chunk downloads.
 *
 * Bundle impact (rough estimates before tree-shaking):
 *   Initial load  ~150 kB gzipped (layout + providers + auth)
 *   Per route     ~10–50 kB gzipped (typically < 5 kB for most pages)
 */

import { lazy, Suspense, type ReactElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'

// ── Eager imports (tiny + used on every route) ──────────────────────────────
import { RootLayout } from './layouts/RootLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { PageLoader } from './components/PageLoader'

// ── Lazy page imports (one chunk per page) ───────────────────────────────────
// Named exports are re-wrapped as default so React.lazy() can resolve them.

const LandingPage = lazy(() =>
  import('./pages/LandingPage').then(m => ({ default: m.LandingPage }))
)
const SignInPage = lazy(() => import('./pages/SignInPage').then(m => ({ default: m.SignInPage })))
const SignUpPage = lazy(() => import('./pages/SignUpPage').then(m => ({ default: m.SignUpPage })))
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage }))
)
const AskLawyerPage = lazy(() =>
  import('./pages/AskLawyerPage').then(m => ({ default: m.AskLawyerPage }))
)

// CrisisManagerPage exports multiple pages from a single file.
const CrisisManagerPage = lazy(() =>
  import('./pages/CrisisManagerPage').then(m => ({ default: m.CrisisManagerPage }))
)
const TicketDecoderPage = lazy(() =>
  import('./pages/CrisisManagerPage').then(m => ({ default: m.TicketDecoderPage }))
)
const ScriptGeneratorPage = lazy(() =>
  import('./pages/CrisisManagerPage').then(m => ({ default: m.ScriptGeneratorPage }))
)
const CostEstimatorPage = lazy(() =>
  import('./pages/CrisisManagerPage').then(m => ({ default: m.CostEstimatorPage }))
)
const LicenseWizardPage = lazy(() =>
  import('./pages/CrisisManagerPage').then(m => ({ default: m.LicenseWizardPage }))
)

const QuizPage = lazy(() => import('./pages/QuizPage').then(m => ({ default: m.QuizPage })))
const ReviewerPage = lazy(() =>
  import('./pages/ReviewerPage').then(m => ({ default: m.ReviewerPage }))
)
const ExamPage = lazy(() => import('./pages/ExamPage').then(m => ({ default: m.ExamPage })))
const ExamResultsPage = lazy(() =>
  import('./pages/ExamResultsPage').then(m => ({ default: m.ExamResultsPage }))
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage }))
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage }))
)

// ── Suspense helper ──────────────────────────────────────────────────────────
// Plain function (not a component) so React does not re-create the boundary
// on every parent render — the Suspense instance stays stable.
function s(element: ReactElement) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

// ── Router definition ────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: s(<LandingPage />),
      },
      {
        path: 'login',
        element: s(<SignInPage />),
      },
      {
        path: 'register',
        element: s(<SignUpPage />),
      },
      {
        path: 'forgot-password',
        element: s(<ForgotPasswordPage />),
      },

      // ── Protected Dashboard Routes ────────────────────────────────────────
      {
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: s(<AskLawyerPage />),
          },
          {
            path: 'ask-lawyer',
            element: s(<AskLawyerPage />),
          },
          {
            path: 'ask-lawyer/:threadId',
            element: s(<AskLawyerPage />),
          },
          {
            path: 'crisis-manager',
            element: s(<CrisisManagerPage />),
          },
          {
            path: 'ticket-decoder',
            element: s(<TicketDecoderPage />),
          },
          {
            path: 'script-generator',
            element: s(<ScriptGeneratorPage />),
          },
          {
            path: 'cost-estimator',
            element: s(<CostEstimatorPage />),
          },
          {
            path: 'license-wizard',
            element: s(<LicenseWizardPage />),
          },
          {
            path: 'quiz',
            element: s(<QuizPage />),
          },
          {
            path: 'quiz/reviewer',
            element: s(<ReviewerPage />),
          },
          {
            path: 'quiz/exam',
            element: s(<ExamPage />),
          },
          {
            path: 'quiz/results',
            element: s(<ExamResultsPage />),
          },
          {
            path: 'profile',
            element: s(<ProfilePage />),
          },
        ],
      },

      // ── 404 ───────────────────────────────────────────────────────────────
      {
        path: '*',
        element: s(<NotFoundPage />),
      },
    ],
  },
])
