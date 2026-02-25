import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'
import { Logo } from '../components/Logo'
import { TermsAndServicesModal } from '../components/TermsAndServices'
import { PrivacyPolicyModal } from '../components/PrivacyPolicy'

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle, signInWithGithub, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      await signUp(email, password, name)
      navigate('/ask-lawyer')
    } catch (err) {
      setError((err as Error).message || 'Failed to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError('')
    try {
      await signInWithGoogle()
      navigate('/ask-lawyer')
    } catch (err) {
      setError((err as Error).message || 'Google sign-up failed. Please try again.')
    }
  }

  const handleGithubSignUp = async () => {
    setError('')
    try {
      await signInWithGithub()
      navigate('/ask-lawyer')
    } catch (err) {
      setError((err as Error).message || 'GitHub sign-up failed. Please try again.')
    }
  }

  return (
    <div className="h-screen w-full bg-white dark:bg-slate-950 flex flex-col">
      {/* Error Message */}
      {error && (
        <div className="max-w-md mx-auto mt-6 w-full px-4">
          <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Center Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <form
          onSubmit={handleSignUp}
          className="w-full max-w-md bg-white dark:bg-card border border-slate-200 dark:border-border rounded-2xl shadow-sm p-6 space-y-4"
        >
          {/* Logo and Header */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Logo size="lg" />
            </div>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Create Account
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Join our Filipino legal driving assistant community
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Juan Dela Cruz"
              required
              className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Terms & Privacy Acceptance */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={e => setAcceptTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-colors"
            />
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              I agree to the{' '}
              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  setShowTerms(true)
                }}
                className="text-primary font-semibold hover:underline focus:outline-none"
              >
                Terms & Services
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={e => {
                  e.preventDefault()
                  setShowPrivacy(true)
                }}
                className="text-primary font-semibold hover:underline focus:outline-none"
              >
                Privacy Policy
              </button>
              , and understand that Maneho AI provides legal information, not legal advice.
            </p>
          </label>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading || !acceptTerms}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition disabled:opacity-60"
          >
            {isSubmitting || loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />

            <span className="text-sm text-slate-400 dark:text-slate-500">or</span>

            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="h-11 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            {/* Github */}
            <button
              type="button"
              onClick={handleGithubSignUp}
              disabled={loading}
              className="h-11 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            By continuing, you agree to our{' '}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-primary hover:underline"
            >
              Terms
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="text-primary hover:underline"
            >
              Privacy
            </button>
          </p>

          {/* Register */}
          <p className="text-sm text-center text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>

      {/* Legal Modals */}
      <TermsAndServicesModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  )
}
