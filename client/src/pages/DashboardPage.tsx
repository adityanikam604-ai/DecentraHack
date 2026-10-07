import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Brain, ArrowRight, BarChart2, BookOpen, Award, TrendingUp,
  CheckCircle, AlertCircle, Clock, LogOut, User, ChevronRight,
  Zap, Target
} from 'lucide-react'

// ── Activity & Mastery Baselines ──────────────────────────────────────────────

const RECENT_ACTIVITY = [
  { topic: 'Linked Lists', action: 'Completed practice session', time: '2 hours ago',  result: 'correct', score: '8/10' },
  { topic: 'Trees',        action: 'Attempted diagnostic quiz',  time: '5 hours ago',  result: 'partial', score: '5/10' },
  { topic: 'Arrays',       action: 'Mastery assessment passed',  time: 'Yesterday',    result: 'correct', score: '9/10' },
  { topic: 'Strings',      action: 'Completed lesson',           time: '2 days ago',   result: 'correct', score: '—'    },
]

const MASTERY = {
  conceptUnderstanding: 82,
  problemSolving:       75,
  application:          80,
  overall:              79,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function progressColor(pct: number) {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-brand-500'
  if (pct >= 40) return 'bg-amber-500'
  return 'bg-rose-400'
}

function statusBadge(status: string) {
  if (status === 'strong')   return 'bg-emerald-50 text-emerald-700 border-emerald-100'
  if (status === 'good')     return 'bg-brand-50 text-brand-700 border-brand-100'
  return 'bg-amber-50 text-amber-700 border-amber-100'
}

function statusLabel(status: string) {
  if (status === 'strong')   return 'Strong'
  if (status === 'good')     return 'Good'
  return 'Needs practice'
}

function resultIcon(result: string) {
  if (result === 'correct') return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
  if (result === 'partial') return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
  return <Clock className="w-3.5 h-3.5 text-navy-400" />
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function DashboardNav({
  onSignOut,
  onStartDiagnostic,
  onOpenTopic,
  onStartPractice,
}: {
  onSignOut: () => void
  onStartDiagnostic?: () => void
  onOpenTopic?: (topicId: string) => void
  onStartPractice?: (topicId?: string) => void
}) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-navy-200">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center flex-shrink-0">
          <img src="/logo-transparent.png" alt="DecentralLearn" className="h-9 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <button
            type="button"
            className="text-sm font-medium text-brand-600 border-b-2 border-brand-600 pb-0.5"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onOpenTopic?.('graphs')}
            className="text-sm font-medium text-navy-500 hover:text-navy-900 transition-colors"
          >
            Learn Topics
          </button>
          <button
            type="button"
            onClick={() => onStartPractice?.('graphs')}
            className="text-sm font-medium text-navy-500 hover:text-navy-900 transition-colors"
          >
            Adaptive Practice
          </button>
          <button
            type="button"
            onClick={onStartDiagnostic}
            className="text-sm font-medium text-navy-500 hover:text-navy-900 transition-colors"
          >
            Diagnostic Assessment
          </button>
          <button
            type="button"
            className="text-sm font-medium text-navy-500 hover:text-navy-900 transition-colors"
          >
            Progress
          </button>
          <button
            type="button"
            className="text-sm font-medium text-navy-500 hover:text-navy-900 transition-colors"
          >
            Certificates
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-navy-50 text-navy-500 hover:text-navy-800 transition-colors"
          >
            <User className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          </button>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 px-3 py-2 rounded-lg hover:bg-navy-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>
    </header>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface DashboardPageProps {
  onStartDiagnostic?: () => void
  onOpenTopic?: (topicId: string) => void
  onStartPractice?: (topicId?: string) => void
}

export default function DashboardPage({
  onStartDiagnostic,
  onOpenTopic,
  onStartPractice,
}: DashboardPageProps = {}) {
  const { user, signOut, learnerProfile } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  // Extract first name from email (fallback to "Learner")
  const displayName = user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Learner'

  // Map Education Level Label from Onboarding
  const eduLabels: Record<string, string> = {
    undergraduate: 'Undergraduate',
    classes_11_12: 'Classes 11–12',
    postgraduate: 'Postgraduate',
    classes_1_10: 'Classes 1–10',
  }
  const educationLevelName = (learnerProfile?.education_level && eduLabels[learnerProfile.education_level]) || 'Undergraduate'

  // Dynamic topic mastery mapped to learner's strengths & practice areas
  const allDsaTopics = [
    { name: 'Arrays',        defaultPct: 92 },
    { name: 'Strings',       defaultPct: 88 },
    { name: 'Linked Lists',  defaultPct: 74 },
    { name: 'Stack & Queue', defaultPct: 65 },
    { name: 'Trees',         defaultPct: 58 },
    { name: 'Graphs',        defaultPct: 38 },
    { name: 'Sorting',       defaultPct: 72 },
    { name: 'Searching',     defaultPct: 64 },
  ]

  const userStrengths = (learnerProfile?.strengths && learnerProfile.strengths.length > 0)
    ? learnerProfile.strengths
    : ['Arrays', 'Strings']

  const userPractice = (learnerProfile?.needs_practice && learnerProfile.needs_practice.length > 0)
    ? learnerProfile.needs_practice
    : ['Trees', 'Graphs']

  const currentTopicList = allDsaTopics.map(t => {
    if (userStrengths.includes(t.name)) {
      return { name: t.name, pct: Math.max(88, t.defaultPct), status: 'strong' as const }
    }
    if (userPractice.includes(t.name)) {
      return { name: t.name, pct: Math.min(42, t.defaultPct), status: 'practice' as const }
    }
    return { name: t.name, pct: t.defaultPct, status: 'good' as const }
  })

  const overallProgress = Math.round(
    currentTopicList.reduce((sum, t) => sum + t.pct, 0) / currentTopicList.length
  )

  const strongTopics    = currentTopicList.filter(t => t.status === 'strong')
  const practiceTopics  = currentTopicList.filter(t => t.status === 'practice')

  // Recommended focus topic
  const focusTopic = practiceTopics.length > 0 ? practiceTopics[0].name : 'Graphs'
  const primaryInterest = learnerProfile?.interests?.[0] || 'railway'

  const interestAnalogies: Record<string, { label: string; analogy: string }> = {
    railway: {
      label: 'Railway & Transit Systems',
      analogy: 'Railway route finding: Stations = Nodes, Tracks = Edges, Delays = Weights.',
    },
    gaming: {
      label: 'Gaming & Game Dev',
      analogy: 'Game level exploration: Game maps = Graphs, Routes = Shortest Path.',
    },
    fintech: {
      label: 'FinTech & Trading',
      analogy: 'High-frequency trading: Order priority = Heaps, Price feeds = Windows.',
    },
    robotics: {
      label: 'Robotics',
      analogy: 'Autonomous navigation: Grid mapping = BFS/DFS, Sensor logs = Buffers.',
    },
    ecommerce: {
      label: 'E-Commerce Logistics',
      analogy: 'Warehouse supply routing: Hubs = Nodes, Shipments = Spanning Trees.',
    },
    space: {
      label: 'Space & Astronomy',
      analogy: 'Orbital trajectories: Planet nodes = Graphs, Telemetry = Queues.',
    },
    'social-media': {
      label: 'Social Media',
      analogy: 'Social graphs: Friends = Directed edges, Feed rankings = Max Heaps.',
    },
    cinema: {
      label: 'Cinema & Streaming',
      analogy: 'Recommendation engines: Matrix clusters = Bipartite Graphs.',
    },
  }

  const activeAnalogy = interestAnalogies[primaryInterest] || {
    label: primaryInterest,
    analogy: 'Real-world analogies tailored to your selected interest domains.',
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <DashboardNav
        onSignOut={handleSignOut}
        onStartDiagnostic={onStartDiagnostic}
        onOpenTopic={onOpenTopic}
        onStartPractice={onStartPractice}
      />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        {/* ── Welcome banner ──────────────────────────────────────── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              Welcome back, <span className="capitalize">{displayName}</span> 👋
            </h1>
            <p className="text-sm text-navy-500 mt-1">
              Data Structures & Algorithms · {educationLevelName} · Goal: {learnerProfile?.learning_goals || 'Placement & Technical Mastery'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onStartPractice && (
              <button
                type="button"
                onClick={() => onStartPractice(focusTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                className="btn-secondary flex items-center gap-2 text-xs font-semibold py-2.5 px-4 text-brand-700 bg-brand-50 border-brand-200 hover:bg-brand-100"
              >
                <Zap className="w-4 h-4 text-brand-600" />
                Practice DSA
              </button>
            )}
            {onStartDiagnostic && (
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="btn-secondary flex items-center gap-2 text-xs font-semibold py-2.5 px-4"
              >
                <Brain className="w-4 h-4 text-brand-600" />
                Diagnostic Assessment
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenTopic?.(focusTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
              className="btn-primary self-start sm:self-auto"
            >
              Continue learning <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Diagnostic Assessment banner ─────────────────────────── */}
        <div className="mb-8 bg-gradient-to-r from-brand-600 to-indigo-700 rounded-2xl p-6 text-white shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">DSA Diagnostic Assessment</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  {learnerProfile?.current_level ? `Diagnosed Level: ${learnerProfile.current_level}` : 'Initial Calibration Ready'}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1 max-w-2xl leading-relaxed">
                Calibrate your knowledge baseline across 8 core DSA topics (Arrays, Strings, Linked Lists, Stack & Queue, Trees, Graphs, Sorting, Searching) with real-time question timers, attempt counters, and instant topic strength detection.
              </p>
            </div>
          </div>
          {onStartDiagnostic && (
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="bg-white text-brand-700 hover:bg-brand-50 transition-all font-semibold text-xs px-5 py-3 rounded-xl shadow flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
            >
              <Zap className="w-4 h-4 text-brand-600" />
              {learnerProfile?.current_level ? 'Recalibrate Assessment' : 'Take Diagnostic Assessment'}
            </button>
          )}
        </div>

        {/* ── Top stat cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Overall Progress', value: `${overallProgress}%`, icon: <BarChart2 className="w-5 h-5" />, color: 'text-brand-600 bg-brand-50' },
            { label: 'Topics Covered',   value: `${currentTopicList.length}/8`,  icon: <BookOpen className="w-5 h-5" />,  color: 'text-violet-600 bg-violet-50' },
            { label: 'Strong Topics',    value: `${strongTopics.length}`,    icon: <TrendingUp className="w-5 h-5" />, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Mastery Score',    value: `${MASTERY.overall}%`,       icon: <Award className="w-5 h-5" />,     color: 'text-amber-600 bg-amber-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-navy-200 rounded-xl p-5 shadow-card">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-navy-900">{s.value}</div>
              <div className="text-xs text-navy-500 mt-0.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left column (2/3) ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Overall progress bar */}
            <div className="bg-white border border-navy-200 rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-navy-900 text-sm">Learning Progress</h2>
                  <p className="text-xs text-navy-400 mt-0.5">Data Structures & Algorithms · {educationLevelName}</p>
                </div>
                <span className="text-2xl font-extrabold text-brand-600">{overallProgress}%</span>
              </div>
              <div className="h-2.5 bg-navy-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-xs text-navy-400 mt-2">
                {currentTopicList.filter(t => t.pct >= 80).length} of {currentTopicList.length} topics mastered
              </p>
            </div>

            {/* Topic breakdown */}
            <div className="bg-white border border-navy-200 rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-navy-900 text-sm">Topic Mastery</h2>
                <button
                  type="button"
                  onClick={() => onOpenTopic?.('arrays')}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3.5">
                {currentTopicList.map(t => {
                  const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                  return (
                    <div
                      key={t.name}
                      onClick={() => onOpenTopic?.(slug)}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-navy-50/80 cursor-pointer transition-colors group"
                      title={`Learn ${t.name}`}
                    >
                      <span className="text-xs text-navy-700 group-hover:text-brand-700 w-24 flex-shrink-0 font-medium transition-colors">
                        {t.name}
                      </span>
                      <div className="flex-1 h-2 bg-navy-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${progressColor(t.pct)}`}
                          style={{ width: `${t.pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-navy-700 w-9 text-right">{t.pct}%</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border hidden sm:inline ${statusBadge(t.status)}`}>
                        {statusLabel(t.status)}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-navy-400 group-hover:text-brand-600 transition-colors" />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white border border-navy-200 rounded-xl p-6 shadow-card">
              <h2 className="font-semibold text-navy-900 text-sm mb-5">Recent Activity</h2>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-navy-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-navy-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-800 truncate">{a.action}</p>
                      <p className="text-xs text-navy-400 mt-0.5">{a.topic} · {a.time}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {resultIcon(a.result)}
                      {a.score !== '—' && (
                        <span className="text-xs font-semibold text-navy-600">{a.score}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column (1/3) ───────────────────────────────── */}
          <div className="space-y-6">

            {/* Continue learning card */}
            <div className="bg-white border border-navy-200 rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand-600" />
                </div>
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-widest">Continue</span>
              </div>
              <h3 className="font-bold text-navy-900 mb-1">{focusTopic}</h3>
              <p className="text-xs text-navy-500 mb-3 leading-relaxed">
                {activeAnalogy.analogy}
              </p>
              <div className="h-1.5 bg-navy-100 rounded-full overflow-hidden mb-4">
                <div className="h-full w-[42%] bg-brand-500 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenTopic?.(focusTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  className="btn-primary flex-1 justify-center text-xs py-2.5"
                >
                  Learn {focusTopic} <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {onStartPractice && (
                  <button
                    type="button"
                    onClick={() => onStartPractice(focusTopic.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                    className="btn-secondary px-3.5 justify-center text-xs py-2.5 flex items-center gap-1.5 text-brand-700 bg-brand-50 border-brand-200 hover:bg-brand-100"
                    title={`Practice ${focusTopic}`}
                  >
                    <Zap className="w-3.5 h-3.5 text-brand-600" />
                    <span>Practice</span>
                  </button>
                )}
              </div>
            </div>

            {/* Recommended next */}
            <div className="bg-white border border-navy-200 rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Target className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-widest">Adaptive Recommendation</span>
              </div>
              <h3 className="font-bold text-navy-900 mb-1">Focus Area: {focusTopic}</h3>
              <p className="text-xs text-navy-500 mb-3 leading-relaxed">
                Personalized for your {activeAnalogy.label} interest profile and {learnerProfile?.preferred_explanation || 'real-world'} learning preference.
              </p>
              <div className="space-y-1.5 text-xs text-navy-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  Strong fundamentals: {strongTopics.map(t => t.name).join(', ') || 'Arrays'}
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  Explanation style: {learnerProfile?.preferred_explanation || 'real-world examples'}
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  Priority target: {practiceTopics.map(t => t.name).join(', ') || focusTopic}
                </div>
              </div>
            </div>

            {/* Strengths & weaknesses */}
            <div className="bg-white border border-navy-200 rounded-xl p-5 shadow-card">
              <h3 className="font-semibold text-navy-900 text-sm mb-4">Your Profile</h3>
              <div className="mb-4">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-2">Strong Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {strongTopics.map(t => (
                    <span key={t.name} className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full px-2.5 py-1 font-medium">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2">Needs Practice</p>
                <div className="flex flex-wrap gap-1.5">
                  {practiceTopics.map(t => (
                    <span key={t.name} className="text-xs bg-amber-50 border border-amber-100 text-amber-700 rounded-full px-2.5 py-1 font-medium">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Certification progress */}
            <div className="bg-white border border-navy-200 rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Award className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-xs font-semibold text-navy-500 uppercase tracking-widest">Certification</span>
              </div>
              <h3 className="font-bold text-navy-900 mb-1">DSA Mastery</h3>
              <p className="text-xs text-navy-500 mb-3">
                Overall mastery score — 80% required to earn your certificate.
              </p>
              {/* Mastery breakdown */}
              {[
                { label: 'Concept Understanding', val: MASTERY.conceptUnderstanding },
                { label: 'Problem Solving',        val: MASTERY.problemSolving       },
                { label: 'Application',            val: MASTERY.application          },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-navy-500 w-28 flex-shrink-0">{m.label}</span>
                  <div className="flex-1 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${m.val}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-navy-700 w-8 text-right">{m.val}%</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-navy-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-navy-600">Overall Mastery</span>
                <span className={`text-sm font-extrabold ${MASTERY.overall >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {MASTERY.overall}%
                </span>
              </div>
              {MASTERY.overall < 80 ? (
                <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {80 - MASTERY.overall}% more needed to unlock your certificate.
                </p>
              ) : (
                <button
                  type="button"
                  className="mt-3 btn-primary w-full justify-center text-xs py-2"
                >
                  Generate Certificate <Award className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
