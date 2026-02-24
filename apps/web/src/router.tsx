import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './layouts/RootLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { AskLawyerPage } from './pages/AskLawyerPage'
import {
  CrisisManagerPage,
  TicketDecoderPage,
  ScriptGeneratorPage,
  CostEstimatorPage,
  LicenseWizardPage,
  QuizPage,
  ProfilePage,
} from './pages/CrisisManagerPage'
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
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
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
