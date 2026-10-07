import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

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

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate   = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm)   { setError('Passwords do not match.'); return }
    if (password.length < 8)    { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/onboarding'), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col items-center justify-center px-6 py-12">

      {/* Logo */}
      <Link to="/" className="flex items-center mb-8">
        <img
          src="/logo.png"
          alt="DecentralLearn"
          className="h-12 w-auto object-contain"
        />
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white border border-navy-200 rounded-2xl shadow-card-md px-8 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-navy-900 mb-1">Create your account</h1>
          <p className="text-sm text-navy-500">Start your personalized learning journey — free.</p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-5 text-sm text-emerald-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Account created! Redirecting to onboarding…
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1.5" htmlFor="signup-email">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1.5" htmlFor="signup-password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
              <input
                id="signup-password"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-700 mb-1.5" htmlFor="signup-confirm">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
              <input
                id="signup-confirm"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={`input-field pl-9 ${confirm && confirm !== password ? 'border-red-400 focus:ring-red-400/30 focus:border-red-400' : ''}`}
              />
            </div>
            {confirm && confirm !== password && (
              <p className="text-xs text-red-600 mt-1.5">Passwords don't match</p>
            )}
          </div>

          <button
            id="signup-submit"
            type="submit"
            disabled={loading || success}
            className="btn-primary w-full mt-1 py-3"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : 'Create account'
            }
          </button>
        </form>

        <p className="text-center text-xs text-navy-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">
            Log in
          </Link>
        </p>
      </div>

      <p className="text-xs text-navy-400 mt-6 text-center max-w-xs">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
