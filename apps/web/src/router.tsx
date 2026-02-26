import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './layouts/RootLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'

// Pages
import { LandingPage } from './pages/LandingPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { AskLawyerPage } from './pages/AskLawyerPage'
import {
  CrisisManagerPage,
  TicketDecoderPage,
  ScriptGeneratorPage,
  CostEstimatorPage,
  LicenseWizardPage,
} from './pages/CrisisManagerPage'
import { QuizPage } from './pages/QuizPage'
import { ReviewerPage } from './pages/ReviewerPage'
import { ExamPage } from './pages/ExamPage'
import { ExamResultsPage } from './pages/ExamResultsPage'
import { ProfilePage } from './pages/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'login',
        element: <SignInPage />,
      },
      {
        path: 'register',
        element: <SignUpPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },

      // Protected Dashboard Routes
      {
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'dashboard',
            element: <AskLawyerPage />,
          },
          {
            path: 'ask-lawyer',
            element: <AskLawyerPage />,
          },
          {
            path: 'ask-lawyer/:threadId',
            element: <AskLawyerPage />,
          },
          {
            path: 'crisis-manager',
            element: <CrisisManagerPage />,
          },
          {
            path: 'ticket-decoder',
            element: <TicketDecoderPage />,
          },
          {
            path: 'script-generator',
            element: <ScriptGeneratorPage />,
          },
          {
            path: 'cost-estimator',
            element: <CostEstimatorPage />,
          },
          {
            path: 'license-wizard',
            element: <LicenseWizardPage />,
          },
          {
            path: 'quiz',
            element: <QuizPage />,
          },
          {
            path: 'quiz/reviewer',
            element: <ReviewerPage />,
          },
          {
            path: 'quiz/exam',
            element: <ExamPage />,
          },
          {
            path: 'quiz/results',
            element: <ExamResultsPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
        ],
      },

      // 404
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
