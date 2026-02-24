import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export function SignInPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, signInWithGithub, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message || 'Failed to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message || 'Google sign-in failed. Please try again.')
    }
  }

  const handleGithubSignIn = async () => {
    setError('')
    try {
      await signInWithGithub()
      navigate('/dashboard')
    } catch (err) {
      setError((err as Error).message || 'GitHub sign-in failed. Please try again.')
    }
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-white dark:bg-slate-950">
      {/* Header / Navigation */}
      <div className="flex items-center bg-white dark:bg-slate-950 p-4 pb-2 justify-between">
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
      <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-gradient-to-b from-primary/10 to-transparent p-8 py-12">
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
        <h1 className="text-slate-900 dark:text-slate-100 tracking-tight font-bold leading-tight text-4xl">
          Welcome Back
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-normal leading-normal mt-2 max-w-xs text-lg">
          Sign in to access your Filipino legal driving assistant
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form Section */}
      <form
        onSubmit={handleSignIn}
        className="flex flex-col w-full max-w-[480px] mx-auto px-4 py-3 gap-y-6"
      >
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
          <div className="flex justify-between items-center pb-2">
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-normal">
              Password
            </p>
            <Link
              to="/forgot-password"
              className="text-primary text-sm font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
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

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="mt-4 w-full bg-primary hover:bg-primary/90 disabled:bg-primary/60 text-white font-bold rounded-lg transition-colors shadow-sm h-16 text-lg"
        >
          {isSubmitting || loading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Divider */}
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-sm font-medium">
            Or continue with
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        {/* Social Logins */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 h-12 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
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
            onClick={handleGithubSignIn}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 h-12 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">GitHub</span>
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="pt-8 pb-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </form>

      {/* Footer / Trust Badges */}
      <div className="mt-auto px-4 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
        <div className="flex justify-center items-center gap-6 opacity-60 grayscale text-xs">
          <span className="font-bold tracking-widest uppercase text-slate-500">
            Authorized by LTO Guidelines
          </span>
          <span className="font-bold tracking-widest uppercase text-slate-500">
            Secure 256-bit Encryption
          </span>
        </div>
      </div>
    </div>
  )
}
