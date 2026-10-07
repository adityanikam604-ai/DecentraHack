import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { PREDEFINED_LEARNING_TOPICS, type LearningTopic } from '../data/learningContent'
import {
  CheckCircle, CheckCircle2, ArrowRight, ArrowLeft,
  Brain, Code, Sparkles, Layers, Clock, Zap, Target,
  ChevronRight, Eye, ShieldCheck, Flame, Copy, Check
} from 'lucide-react'

interface LearningContentPageProps {
  initialTopicId?: string
  onBackToDashboard: () => void
  onPracticeTopic?: (topicName: string) => void
}

interface TopicProgressMap {
  [topicId: string]: {
    progress: number
    completed: boolean
    masteryScore: number
    dbId?: string
  }
}

// ── Lightweight High-Contrast Syntax Highlighter ────────────────────────────
function colorizeKeywords(text: string) {
  if (!text) return null
  const tokenRegex = /(\b(?:class|struct|public|private|static|void|int|bool|char|size_t|return|while|for|if|else|new|nullptr|null|const|include|import|package|true|false)\b|\b(?:std|vector|string|stack|queue|unordered_set|unordered_map|map|set|ListNode|TreeNode|List|ArrayList|LinkedList|Map|Set|Queue|Stack|Collections|Arrays|Character|Integer|String)\b|"[^"]*"|\b\d+\b)/g

  const parts = text.split(tokenRegex)
  return (
    <>
      {parts.map((part, i) => {
        if (/^(class|struct|public|private|static|void|int|bool|char|size_t|return|while|for|if|else|new|nullptr|null|const|include|import|package|true|false)$/.test(part)) {
          return <span key={i} className="text-sky-300 font-bold">{part}</span>
        }
        if (/^(std|vector|string|stack|queue|unordered_set|unordered_map|map|set|ListNode|TreeNode|List|ArrayList|LinkedList|Map|Set|Queue|Stack|Collections|Arrays|Character|Integer|String)$/.test(part)) {
          return <span key={i} className="text-cyan-300 font-semibold">{part}</span>
        }
        if (/^"[^"]*"$/.test(part)) {
          return <span key={i} className="text-amber-300">{part}</span>
        }
        if (/^\d+$/.test(part)) {
          return <span key={i} className="text-pink-300 font-medium">{part}</span>
        }
        return <span key={i} className="text-slate-100">{part}</span>
      })}
    </>
  )
}

function highlightCodeLine(line: string) {
  const commentIdx = line.indexOf('//')
  if (commentIdx !== -1) {
    const codePart = line.slice(0, commentIdx)
    const commentPart = line.slice(commentIdx)
    return (
      <>
        {colorizeKeywords(codePart)}
        <span className="text-emerald-400 font-semibold">{commentPart}</span>
      </>
    )
  }
  return colorizeKeywords(line)
}

export default function LearningContentPage({
  initialTopicId = 'graphs',
  onBackToDashboard,
  onPracticeTopic,
}: LearningContentPageProps) {
  const { user, learnerProfile } = useAuth()

  // Find initial topic or fallback to first
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    const found = PREDEFINED_LEARNING_TOPICS.find(
      t => t.id === initialTopicId || t.name.toLowerCase() === initialTopicId.toLowerCase()
    )
    return found ? found.id : 'graphs'
  })

  // Learner profile preferences
  const activeInterestKey = learnerProfile?.interests?.[0] || 'railway'
  const activeStyleKey = learnerProfile?.preferred_explanation || 'real-world examples'

  // Interactive style toggle (defaults to learner preference)
  const [currentStyle, setCurrentStyle] = useState<'real-world examples' | 'step-by-step' | 'visual' | 'theoretical'>(
    (activeStyleKey as any) || 'real-world examples'
  )

  // Language selector: C++ by default for undergraduate DSA learners
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'java'>('cpp')
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      // fallback
    }
  }

  // Progress state per topic
  const [progressMap, setProgressMap] = useState<TopicProgressMap>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null)
  const [practicePromptOpen, setPracticePromptOpen] = useState(false)

  // Fetch or initialize topic progress from Supabase
  useEffect(() => {
    let isMounted = true

    async function loadProgress() {
      if (!user) return

      try {
        // Query database topics and learning progress
        const [{ data: dbTopics }, { data: dbProgress }] = await Promise.all([
          supabase.from('topics').select('id, name, slug'),
          supabase.from('learning_progress').select('topic_id, progress_percentage, mastery_score, completed').eq('user_id', user.id),
        ])

        const initialMap: TopicProgressMap = {}

        // Prepopulate from learningContent topics
        PREDEFINED_LEARNING_TOPICS.forEach(t => {
          // Check if matched in database progress
          const matchedDbTopic = dbTopics?.find(
            d => d.slug === t.id || d.name.toLowerCase() === t.name.toLowerCase()
          )

          const progressRow = matchedDbTopic
            ? dbProgress?.find(p => p.topic_id === matchedDbTopic.id)
            : null

          // Fallback based on learner profile strengths
          const isUserStrength = learnerProfile?.strengths?.includes(t.name)
          const isUserPractice = learnerProfile?.needs_practice?.includes(t.name)
          const defaultPct = isUserStrength ? 88 : isUserPractice ? 38 : 60

          initialMap[t.id] = {
            progress: progressRow ? progressRow.progress_percentage : defaultPct,
            completed: progressRow ? progressRow.completed : (isUserStrength || defaultPct >= 80),
            masteryScore: progressRow ? progressRow.mastery_score : (isUserStrength ? 85 : 65),
            dbId: matchedDbTopic?.id,
          }
        })

        if (isMounted) {
          setProgressMap(initialMap)
        }
      } catch (err) {
        console.warn('Could not load topic progress from Supabase:', err)
      }
    }

    loadProgress()
    return () => {
      isMounted = false
    }
  }, [user, learnerProfile])

  const currentTopic: LearningTopic =
    PREDEFINED_LEARNING_TOPICS.find(t => t.id === selectedTopicId) || PREDEFINED_LEARNING_TOPICS[0]

  const currentProgressInfo = progressMap[currentTopic.id] || {
    progress: 50,
    completed: false,
    masteryScore: 60,
  }

  // Handle Mark as Completed
  const handleToggleComplete = async () => {
    if (!user) return
    setIsSaving(true)
    setSaveSuccessMsg(null)

    const nextCompleted = !currentProgressInfo.completed
    const nextProgress = nextCompleted ? 100 : 50
    const nextMastery = nextCompleted ? 88 : 65

    // Optimistic UI update
    setProgressMap(prev => ({
      ...prev,
      [currentTopic.id]: {
        ...prev[currentTopic.id],
        progress: nextProgress,
        completed: nextCompleted,
        masteryScore: nextMastery,
      },
    }))

    try {
      // Find or query topic ID in Supabase
      let topicDbId = currentProgressInfo.dbId
      if (!topicDbId) {
        const { data: dbTopic } = await supabase
          .from('topics')
          .select('id')
          .or(`slug.eq.${currentTopic.id},name.ilike.%${currentTopic.name}%`)
          .maybeSingle()
        topicDbId = dbTopic?.id
      }

      if (topicDbId) {
        await supabase
          .from('learning_progress')
          .upsert({
            user_id: user.id,
            topic_id: topicDbId,
            progress_percentage: nextProgress,
            mastery_score: nextMastery,
            completed: nextCompleted,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,topic_id' })
      }

      setSaveSuccessMsg(nextCompleted ? 'Topic marked as completed! Progress updated in Supabase.' : 'Topic marked in progress.')
      setTimeout(() => setSaveSuccessMsg(null), 3500)
    } catch (err) {
      console.error('Error saving topic completion:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Next / Previous Topic handlers
  const currentIdx = PREDEFINED_LEARNING_TOPICS.findIndex(t => t.id === currentTopic.id)
  const prevTopic = currentIdx > 0 ? PREDEFINED_LEARNING_TOPICS[currentIdx - 1] : null
  const nextTopic = currentIdx < PREDEFINED_LEARNING_TOPICS.length - 1 ? PREDEFINED_LEARNING_TOPICS[currentIdx + 1] : null

  // Analogy for current interest
  const interestAnalogy =
    currentTopic.interestAnalogies[activeInterestKey] ||
    currentTopic.interestAnalogies['railway'] ||
    Object.values(currentTopic.interestAnalogies)[0]

  // Explanation for active style
  const styleExplanation = currentTopic.styleExplanations[currentStyle] || currentTopic.styleExplanations['real-world examples']

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white border-b border-navy-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="p-2 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-navy-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-5 w-px bg-navy-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-navy-400 uppercase tracking-wider">Module:</span>
              <span className="text-xs font-bold text-navy-800">DSA Learning Content</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Practice button */}
            <button
              type="button"
              onClick={() => {
                if (onPracticeTopic) {
                  onPracticeTopic(currentTopic.name)
                } else {
                  setPracticePromptOpen(true)
                }
              }}
              className="btn-secondary flex items-center gap-2 text-xs font-semibold py-2 px-3.5"
            >
              <Zap className="w-3.5 h-3.5 text-brand-600" />
              <span>Practice This Topic</span>
            </button>

            {/* Mark completed */}
            <button
              type="button"
              onClick={handleToggleComplete}
              disabled={isSaving}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all border ${
                currentProgressInfo.completed
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-brand-600 text-white border-brand-600 hover:bg-brand-700 shadow-sm'
              }`}
            >
              {isSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : currentProgressInfo.completed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              <span>{currentProgressInfo.completed ? 'Completed' : 'Mark as Completed'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* ── Left Sidebar: Topic Selector (1 col) ─────────────────── */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-navy-200 rounded-2xl p-5 shadow-card sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400">Curriculum</h3>
                <h2 className="text-sm font-bold text-navy-900 mt-0.5">DSA Topics ({PREDEFINED_LEARNING_TOPICS.length})</h2>
              </div>
              <span className="text-[10px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100">
                Undergraduate
              </span>
            </div>

            <div className="space-y-1.5">
              {PREDEFINED_LEARNING_TOPICS.map(topic => {
                const isActive = topic.id === currentTopic.id
                const prog = progressMap[topic.id]
                const isDone = prog?.completed
                const pct = prog?.progress ?? 0

                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      setSelectedTopicId(topic.id)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex flex-col gap-1.5 ${
                      isActive
                        ? 'bg-brand-50/80 border-brand-300 text-brand-900 shadow-sm'
                        : 'bg-white border-transparent hover:bg-navy-50 text-navy-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-brand-600' : 'bg-navy-300'}`} />
                        )}
                        <span className={`text-xs font-bold truncate ${isActive ? 'text-brand-900' : 'text-navy-800'}`}>
                          {topic.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-navy-400 font-medium">
                        {pct}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-navy-400">{topic.category}</span>
                      <div className="w-16 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isDone ? 'bg-emerald-500' : pct >= 60 ? 'bg-brand-500' : 'bg-amber-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Learner model badge */}
            <div className="mt-5 pt-4 border-t border-navy-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-navy-500">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="text-[11px] font-medium">
                  Interest: <strong className="text-navy-700 capitalize">{activeInterestKey}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-navy-500">
                <Eye className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                <span className="text-[11px] font-medium">
                  Style: <strong className="text-navy-700 capitalize">{activeStyleKey}</strong>
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right Content: Learning Topic Detail (3 cols) ────────── */}
        <main className="lg:col-span-3 space-y-6">

          {/* Toast Notification */}
          {saveSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveSuccessMsg(null)}
                className="text-emerald-600 hover:text-emerald-900 text-xs font-bold ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ── Topic Hero Banner ──────────────────────────────────── */}
          <div className="bg-white border border-navy-200 rounded-2xl p-6 sm:p-8 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-navy-100">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap mb-2">
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100 uppercase tracking-wider">
                    {currentTopic.category}
                  </span>
                  <span className="text-xs font-semibold text-navy-500 bg-navy-100 px-2.5 py-1 rounded-full">
                    {currentTopic.difficulty}
                  </span>
                  <span className="text-xs text-navy-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> ~{currentTopic.estimatedMinutes} mins
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                  {currentTopic.name}
                </h1>
              </div>

              {/* Progress counter & action */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="text-right">
                  <div className="text-xs font-medium text-navy-400">Mastery Level</div>
                  <div className="text-lg font-bold text-navy-800">{currentProgressInfo.masteryScore}%</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center font-bold text-brand-700 text-sm">
                  {currentProgressInfo.progress}%
                </div>
              </div>
            </div>

            {/* Overview text */}
            <div className="pt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy-400 mb-2">Core Overview</h2>
              <p className="text-sm text-navy-700 leading-relaxed font-normal">
                {currentTopic.overview}
              </p>
            </div>

            {/* Prerequisites */}
            <div className="mt-4 pt-4 border-t border-navy-50 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-navy-400">Prerequisites:</span>
              {currentTopic.prerequisites.map(p => (
                <span key={p} className="text-xs bg-navy-50 text-navy-600 px-2.5 py-0.5 rounded-md border border-navy-100 font-medium">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* ── Adaptive Relatable Analogy Card (Interest-driven) ──── */}
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl p-6 sm:p-7 text-white shadow-card">
            <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/40 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Adaptive Analogy · {activeInterestKey.toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-semibold bg-slate-800 text-slate-200 px-3 py-1 rounded-full border border-slate-700">
                Personalized from Onboarding
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2.5 tracking-tight">
              {interestAnalogy.title}
            </h3>
            <p className="text-sm text-slate-100 leading-relaxed mb-6 font-normal">
              {interestAnalogy.narrative}
            </p>

            {/* Concept Mapping Table with Crystal-Clear Contrast */}
            <div className="bg-[#1e293b] rounded-xl p-4 sm:p-5 border border-slate-700 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Conceptual Mapping
              </div>
              <div className="divide-y divide-slate-700/80">
                {interestAnalogy.mapping.map((m, i) => (
                  <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-4 py-2.5 text-xs first:pt-1 last:pb-1">
                    <span className="font-bold text-white tracking-wide">{m.term}</span>
                    <span className="text-sky-300 font-bold flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      {m.dsaConcept}
                    </span>
                    <span className="text-slate-200 text-xs leading-normal">{m.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Explanation Style Selector & Content ───────────────── */}
          <div className="bg-white border border-navy-200 rounded-2xl p-6 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-navy-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400">Explanation Style</h3>
                <h2 className="text-base font-bold text-navy-900 mt-0.5">
                  {styleExplanation.headline}
                </h2>
              </div>

              {/* Style switcher tabs */}
              <div className="flex items-center gap-1 bg-navy-50 p-1 rounded-xl border border-navy-200 flex-wrap">
                {[
                  { id: 'real-world examples', label: 'Real-World', icon: <Sparkles className="w-3 h-3" /> },
                  { id: 'step-by-step',        label: 'Step-by-Step', icon: <Layers className="w-3 h-3" /> },
                  { id: 'visual',              label: 'Visual',      icon: <Eye className="w-3 h-3" /> },
                  { id: 'theoretical',         label: 'Theoretical', icon: <Brain className="w-3 h-3" /> },
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentStyle(s.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      currentStyle === s.id
                        ? 'bg-white text-brand-700 shadow-sm border border-navy-200 font-bold'
                        : 'text-navy-500 hover:text-navy-800'
                    }`}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation body */}
            <div className="text-sm text-navy-700 leading-relaxed whitespace-pre-line font-normal">
              {styleExplanation.body}
            </div>

            {/* Visual Diagram if available */}
            {styleExplanation.visualDiagram && (
              <div className="p-4 bg-navy-900 text-brand-200 font-mono text-xs rounded-xl overflow-x-auto border border-navy-800">
                <div className="text-[10px] text-navy-400 uppercase tracking-widest mb-2 font-sans font-bold">
                  Memory / Flow Architecture
                </div>
                <pre className="leading-tight">{styleExplanation.visualDiagram}</pre>
              </div>
            )}
          </div>

          {/* ── Key Concepts & Complexity Table ────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Core Principles */}
            <div className="bg-white border border-navy-200 rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-brand-600" /> Core Principles
              </h3>
              <ul className="space-y-2.5">
                {currentTopic.corePrinciples.map((principle, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-navy-700 leading-relaxed">
                    <span className="w-4 h-4 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Time & Space Complexity */}
            <div className="bg-white border border-navy-200 rounded-2xl p-6 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" /> Complexity Bounds
              </h3>
              <div className="space-y-2">
                {currentTopic.timeComplexity.map((tc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-navy-50/70 border border-navy-100 text-xs">
                    <div>
                      <span className="font-semibold text-navy-800">{tc.operation}</span>
                      <p className="text-[10px] text-navy-400">{tc.note}</p>
                    </div>
                    <span className="font-mono font-bold text-brand-700 bg-white px-2 py-0.5 rounded border border-navy-200">
                      {tc.complexity}
                    </span>
                  </div>
                ))}
                <div className="pt-2 text-xs text-navy-600 flex items-center justify-between">
                  <span className="font-bold text-navy-700">Space Complexity:</span>
                  <span className="font-mono text-navy-800 font-semibold">{currentTopic.spaceComplexity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Code Implementation Walkthrough ────────────────────── */}
          {(() => {
            const activeCodeSnippet = currentTopic.codeExamples[selectedLanguage] || currentTopic.codeExamples.cpp
            return (
              <div className="bg-white border border-navy-200 rounded-2xl p-6 shadow-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400">Canonical Implementation</h3>
                      <h2 className="text-sm font-bold text-navy-900">{activeCodeSnippet.title}</h2>
                    </div>
                  </div>

                  {/* Language Selector: C++ (Default) vs Java */}
                  <div className="flex items-center gap-1 bg-navy-50 p-1 rounded-xl border border-navy-200 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('cpp')}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        selectedLanguage === 'cpp'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-navy-600 hover:text-navy-900'
                      }`}
                    >
                      C++ (Default)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLanguage('java')}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        selectedLanguage === 'java'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'text-navy-600 hover:text-navy-900'
                      }`}
                    >
                      Java
                    </button>
                  </div>
                </div>

                {/* Editor Container with Syntax Highlighting and Line Numbers */}
                <div className="bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                  {/* Top Bar with Filename, Language Tag and Copy Button */}
                  <div className="bg-[#1e293b] px-4 py-2.5 border-b border-slate-700/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="ml-2 text-xs font-mono font-semibold text-slate-300">
                        {selectedLanguage === 'cpp' ? `${currentTopic.id}.cpp` : `${currentTopic.id}.java`}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                        {selectedLanguage === 'cpp' ? 'C++ 20' : 'Java 17'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(activeCodeSnippet.code)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg border border-slate-700 transition-colors"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Code Lines with High-Contrast Syntax & Line Numbers */}
                  <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-slate-100">
                    <table className="w-full border-collapse">
                      <tbody>
                        {activeCodeSnippet.code.split('\n').map((line, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="pr-4 py-0.5 text-right text-slate-600 select-none text-[11px] w-8">
                              {idx + 1}
                            </td>
                            <td className="py-0.5 whitespace-pre font-mono">
                              {highlightCodeLine(line)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <p className="text-xs text-navy-600 bg-brand-50/60 p-3.5 rounded-xl border border-brand-100 leading-relaxed">
                  💡 <strong className="text-navy-800">Explanation:</strong> {activeCodeSnippet.explanation}
                </p>
              </div>
            )
          })()}

          {/* ── Key Summary Takeaways ──────────────────────────────── */}
          <div className="bg-white border border-navy-200 rounded-2xl p-6 shadow-card space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Summary & Key Takeaways
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentTopic.summaryTakeaways.map((takeaway, i) => (
                <div key={i} className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl text-xs text-navy-700 leading-relaxed flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>{takeaway}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Footer Navigation & Actions ────────────────────────── */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-navy-200">
            {/* Previous Topic */}
            {prevTopic ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedTopicId(prevTopic.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="btn-secondary flex items-center gap-2 text-xs font-semibold px-4 py-2.5 w-full sm:w-auto justify-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Prev: {prevTopic.name}</span>
              </button>
            ) : (
              <div />
            )}

            {/* Center Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={handleToggleComplete}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all border ${
                  currentProgressInfo.completed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-navy-700 border-navy-300 hover:border-navy-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{currentProgressInfo.completed ? 'Topic Completed' : 'Mark as Completed'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onPracticeTopic) {
                    onPracticeTopic(currentTopic.id)
                  } else {
                    setPracticePromptOpen(true)
                  }
                }}
                className="btn-primary flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>Practice {currentTopic.name}</span>
              </button>
            </div>

            {/* Next Topic */}
            {nextTopic ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedTopicId(nextTopic.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="btn-secondary flex items-center gap-2 text-xs font-semibold px-4 py-2.5 w-full sm:w-auto justify-center"
              >
                <span>Next: {nextTopic.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div />
            )}
          </div>
        </main>
      </div>

      {/* Modal / Dialog for Practice Next Step */}
      {practicePromptOpen && (
        <div className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-navy-200 animate-scale-up space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">
                Launch Adaptive Practice
              </h3>
              <p className="text-xs text-navy-500 mt-1 leading-relaxed">
                You have selected to practice <strong>{currentTopic.name}</strong>. The Activity Agent will calibrate questions based on your diagnostic baseline and adjust difficulty in real-time.
              </p>
            </div>
            <div className="p-3 bg-navy-50 rounded-xl border border-navy-200 text-xs text-navy-600 space-y-1">
              <div>• <strong>Topic:</strong> {currentTopic.name}</div>
              <div>• <strong>Baseline:</strong> {currentProgressInfo.progress}% progress</div>
              <div>• <strong>Style:</strong> {currentStyle}</div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPracticePromptOpen(false)}
                className="btn-secondary text-xs px-4 py-2"
              >
                Continue Reading
              </button>
              <button
                type="button"
                onClick={() => {
                  setPracticePromptOpen(false)
                  if (onPracticeTopic) {
                    onPracticeTopic(currentTopic.id)
                  } else {
                    onBackToDashboard()
                  }
                }}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
