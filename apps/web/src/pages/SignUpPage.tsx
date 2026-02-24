import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react'
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
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950">
      {/* Header / Navigation */}
      <div className="flex items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-200/50 dark:border-slate-700/50">
        <button
          onClick={() => navigate('/')}
          className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
          Maneho AI
        </h2>
      </div>

      {/* Brand Logo Area */}
      <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-gradient-to-b from-primary/5 to-transparent p-8 py-12">
        <div className="w-16 h-16 mx-auto mb-4">
          <img
            src="/new-maneho-logo-removebg-preview.png"
            alt="Maneho AI Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Welcome Text */}
      <div className="flex flex-col items-center px-4 pt-8 pb-4 text-center">
        <h1 className="text-white tracking-tight font-bold leading-tight text-4xl">
          Create Account
        </h1>
        <p className="text-slate-200 font-normal leading-normal mt-2 max-w-xs text-lg">
          Join our Filipino legal driving assistant community
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form Section - Glasmorphism Card */}
      <form
        onSubmit={handleSignUp}
        className="flex flex-col w-full max-w-[480px] mx-auto px-4 py-6 gap-y-6 my-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-lg shadow-2xl"
      >
        {/* Full Name Field */}
        <label className="flex flex-col w-full">
          <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-2">
            Full Name
          </p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Juan Dela Cruz"
            required
            className="w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 p-4 text-base font-normal h-16"
          />
        </label>

        {/* Email Field */}
        <label className="flex flex-col w-full">
          <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-2">
            Email Address
          </p>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 p-4 text-base font-normal h-16"
          />
        </label>

        {/* Password Field */}
        <label className="flex flex-col w-full">
          <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-2">
            Password
          </p>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              className="w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 p-4 text-base font-normal h-16 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </label>

        {/* Confirm Password Field */}
        <label className="flex flex-col w-full">
          <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal pb-2">
            Confirm Password
          </p>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              className="w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 p-4 text-base font-normal h-16 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </label>

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

        {/* Sign Up Button */}
        <button
          type="submit"
          disabled={isSubmitting || loading || !acceptTerms}
          className="mt-4 w-full bg-primary hover:bg-primary/90 disabled:bg-primary/60 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-sm h-16 text-lg"
        >
          {isSubmitting || loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* Legal Copy */}
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 leading-relaxed">
          By signing up with any method, you agree to our Terms & Privacy
        </p>

        {/* Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-sm font-medium">
            Or sign up with
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        {/* Social Signups */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || !acceptTerms}
            className="flex-1 flex items-center justify-center gap-2 h-12 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">Google</span>
          </button>
          <button
            type="button"
            onClick={handleGithubSignUp}
            disabled={loading || !acceptTerms}
            className="flex-1 flex items-center justify-center gap-2 h-12 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">GitHub</span>
          </button>
        </div>

        {/* Sign In Link */}
        <div className="pt-8 pb-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </form>

      {/* Footer / Trust Badges */}
      <div className="mt-auto px-4 py-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex justify-center items-center gap-3 mb-3">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Secure, encrypted authentication powered by Firebase
          </p>
        </div>
        <div className="flex justify-center items-center gap-6 opacity-75">
          <span className="text-xs font-bold tracking-widest uppercase text-slate-600 dark:text-slate-400">
            256-bit Encryption
          </span>
          <span className="text-xs font-bold tracking-widest uppercase text-slate-600 dark:text-slate-400">
            LTO Guidelines
          </span>
        </div>
      </div>

      {/* Legal Modals */}
      <TermsAndServicesModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  )
}
