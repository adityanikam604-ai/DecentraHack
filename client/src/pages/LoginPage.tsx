import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Mail, Lock, Eye, EyeOff, AlertCircle,
  CheckCircle, TrendingUp, Award, BookOpen, CheckCircle2
} from 'lucide-react'

// ── Left panel feature bullets ────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <BookOpen className="w-4 h-4" />,
    text: 'AI adapts content to your knowledge level',
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    text: 'Real mastery tracking — not just completion',
  },
  {
    icon: <Award className="w-4 h-4" />,
    text: 'Blockchain-verified certificates on completion',
  },
]

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Contains a number',     ok: /\d/.test(password) },
    { label: 'Contains a letter',     ok: /[a-zA-Z]/.test(password) },
  ]
  return (
    <div className="flex gap-3 mt-2 flex-wrap">
      {checks.map(c => (
        <div key={c.label} className={`flex items-center gap-1 text-[11px] font-medium ${c.ok ? 'text-emerald-600' : 'text-navy-400'}`}>
          <CheckCircle2 className="w-3 h-3" />
          {c.label}
        </div>
      ))}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { signIn, signUp } = useAuth()

  const [isSignUp,        setIsSignUp]        = useState(false)
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass,        setShowPass]        = useState(false)
  const [error,           setError]           = useState<string | null>(null)
  const [submitting,      setSubmitting]      = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.')
        return
      }
      setSubmitting(true)
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
        setSubmitting(false)
      }
    } else {
      setSubmitting(true)
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col px-14 py-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 100%)' }}
      >
        {/* Subtle background pattern — soft concentric arcs */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 110% 110%, rgba(255,255,255,0.06) 0%, transparent 55%),
                              radial-gradient(circle at -10% -10%, rgba(255,255,255,0.04) 0%, transparent 50%)`,
          }}
        />

        {/* Top — logo (transparent white logo on blue gradient) */}
        <div className="relative z-10">
          <Link to="/" className="inline-block">
            <img
              src="/logo-white.png"
              alt="DecentralLearn"
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Middle — headline + description */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-5">
            Learn · Grow · Build Your Future
          </p>

          <h1 className="text-white font-extrabold leading-tight mb-5"
              style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
            Learning designed<br />around you.
          </h1>

          <p className="text-blue-100 text-sm leading-relaxed mb-10 max-w-sm opacity-90">
            DecentralLearn adapts every lesson, example, and practice question
            to your knowledge, interests, and progress — so you always learn
            at exactly the right level.
          </p>

          {/* Feature bullets */}
          <div className="space-y-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 text-white">
                  {f.icon}
                </div>
                <span className="text-sm text-blue-100">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
      <div className="flex-1 bg-white flex flex-col justify-between min-h-screen">

        {/* Top bar with logo (visible on mobile + as secondary on desktop) */}
        <div className="flex items-center justify-between px-8 pt-8 pb-0">
          {/* On mobile show full logo; on desktop top-bar is clean */}
          <Link to="/" className="lg:hidden inline-block">
            <img src="/logo-transparent.png" alt="DecentralLearn" className="h-10 w-auto object-contain" />
          </Link>
          {/* Spacer to push sign-up link to the right on desktop */}
          <span className="hidden lg:block" />
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
            className="text-xs text-navy-500 hover:text-brand-600 font-medium transition-colors"
          >
            {isSignUp ? (
              <>Already have an account? <span className="text-brand-600 font-semibold">Sign in</span></>
            ) : (
              <>New here? <span className="text-brand-600 font-semibold">Sign up free</span></>
            )}
          </button>
        </div>

        {/* Centre — form area */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          <div className="w-full max-w-[380px]">

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-1.5">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-sm text-navy-500">
                {isSignUp
                  ? 'Start your personalized learning journey — free.'
                  : 'Continue your personalized learning journey.'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-navy-700 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10 py-3"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-navy-700"
                  >
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    required
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field pl-10 pr-11 py-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isSignUp && <PasswordStrength password={password} />}
              </div>

              {/* Confirm Password (only for signup) */}
              {isSignUp && (
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold text-navy-700 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
                    <input
                      id="confirm-password"
                      type={showPass ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="input-field pl-10 pr-11 py-3"
                    />
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-sm mt-2"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  isSignUp ? 'Create account' : 'Log in'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-navy-200" />
              <span className="text-xs text-navy-400 font-medium">or</span>
              <div className="flex-1 h-px bg-navy-200" />
            </div>

            {/* Mode switch link */}
            <p className="text-center text-sm text-navy-500">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
                className="text-brand-600 hover:text-brand-700 font-semibold transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up free'}
              </button>
            </p>

            {/* Trust badge */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-navy-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              Secured with Supabase Authentication
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-xs text-navy-400">
            By logging in, you agree to our{' '}
            <span className="text-brand-600 font-medium cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-brand-600 font-medium cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
