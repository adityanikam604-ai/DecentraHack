import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { PREDEFINED_PRACTICE_QUESTIONS, type PracticeQuestion } from '../data/practiceQuestions'
import { PREDEFINED_LEARNING_TOPICS } from '../data/learningContent'
import { shuffleArray } from '../utils/shuffle'
import {
  Brain, Zap, Clock, Lightbulb, CheckCircle2, XCircle,
  ArrowRight, ArrowLeft, RefreshCw, Award, Sparkles,
  BookOpen, Check, X
} from 'lucide-react'

interface PracticePageProps {
  initialTopicId?: string
  onBackToDashboard: () => void
  onOpenLearningTopic?: (topicId: string) => void
}

interface AttemptRecord {
  questionId: string
  questionText: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  selectedAnswer: string
  correctAnswer: string
  isCorrect: boolean
  timeTaken: number
  hintsUsed: number
  attemptsCount: number
}

// Map difficulty colors
function difficultyBadge(diff: 'easy' | 'medium' | 'hard') {
  if (diff === 'easy') {
    return {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Easy',
      dot: 'bg-emerald-500',
    }
  }
  if (diff === 'medium') {
    return {
      bg: 'bg-brand-50 text-brand-700 border-brand-200',
      label: 'Medium',
      dot: 'bg-brand-500',
    }
  }
  return {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    label: 'Hard',
    dot: 'bg-purple-500',
  }
}

export default function PracticePage({
  initialTopicId = 'graphs',
  onBackToDashboard,
  onOpenLearningTopic,
}: PracticePageProps) {
  const { user, learnerProfile } = useAuth()

  // ── Available topics ────────────────────────────────────────────────────────
  const topicsList = PREDEFINED_LEARNING_TOPICS.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
  }))

  // Resolve active topic
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    const match = topicsList.find(
      t => t.id === initialTopicId || t.name.toLowerCase() === initialTopicId.toLowerCase()
    )
    return match ? match.id : 'graphs'
  })

  const currentTopicMeta = topicsList.find(t => t.id === selectedTopicId) || topicsList[0]

  // ── Pre-cached Supabase topic UUIDs ─────────────────────────────────────────
  const [topicDbMap, setTopicDbMap] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadTopicUuids() {
      try {
        const { data } = await supabase.from('topics').select('id, slug, name')
        if (data && data.length > 0) {
          const map: Record<string, string> = {}
          data.forEach(t => {
            map[t.slug] = t.id
            map[t.name.toLowerCase()] = t.id
          })
          setTopicDbMap(map)
        }
      } catch (err) {
        console.error('Failed to load topic UUIDs from Supabase:', err)
      }
    }
    loadTopicUuids()
  }, [])

  // ── Diagnostic Baseline Determination ───────────────────────────────────────
  const determineInitialDifficulty = (topicName: string): 'easy' | 'medium' | 'hard' => {
    const strengths = learnerProfile?.strengths || []
    const needsPractice = learnerProfile?.needs_practice || []
    const overallLevel = learnerProfile?.current_level || 'intermediate'
    const diffPref = learnerProfile?.difficulty_preference || 'medium'

    // Topic explicitly flagged in needs practice from diagnostic
    if (needsPractice.some(t => t.toLowerCase() === topicName.toLowerCase())) {
      return 'easy'
    }

    // Topic explicitly flagged in strengths
    if (strengths.some(t => t.toLowerCase() === topicName.toLowerCase())) {
      return diffPref === 'hard' || overallLevel === 'advanced' ? 'hard' : 'medium'
    }

    // Fall back to general diagnostic level
    if (overallLevel === 'beginner') return 'easy'
    if (overallLevel === 'advanced') return 'hard'
    return 'medium'
  }

  // ── Smart Question Selector (Prevents Repeated Questions) ───────────────────
  const selectUnusedQuestion = (
    topicId: string,
    targetDiff: 'easy' | 'medium' | 'hard',
    usedIds: string[]
  ): PracticeQuestion | null => {
    const allTopicQuestions = PREDEFINED_PRACTICE_QUESTIONS.filter(
      q => q.topicId === topicId || q.topicName.toLowerCase() === topicId.toLowerCase()
    )

    // Filter out questions already seen in this session
    const unusedQuestions = allTopicQuestions.filter(q => !usedIds.includes(q.id))
    if (unusedQuestions.length === 0) {
      return null
    }

    // 1st priority: Unused question with exact target difficulty
    const exactMatch = unusedQuestions.find(q => q.difficulty === targetDiff)

    // 2nd priority: Unused question with nearest difficulty
    const priorityOrder: ('easy' | 'medium' | 'hard')[] =
      targetDiff === 'hard'
        ? ['hard', 'medium', 'easy']
        : targetDiff === 'easy'
        ? ['easy', 'medium', 'hard']
        : ['medium', 'hard', 'easy']

    let fallbackMatch: PracticeQuestion | undefined
    for (const diff of priorityOrder) {
      fallbackMatch = unusedQuestions.find(q => q.difficulty === diff)
      if (fallbackMatch) break
    }

    const chosen = exactMatch || fallbackMatch || unusedQuestions[0]

    // Return question with independently randomized option positions
    return {
      ...chosen,
      options: shuffleArray(chosen.options),
    }
  }

  // ── State Tracking ──────────────────────────────────────────────────────────
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>(() => {
    return determineInitialDifficulty(currentTopicMeta.name)
  })

  // Track question IDs already presented in the current session
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [sessionAttempts, setSessionAttempts] = useState<AttemptRecord[]>([])
  const [sessionFinished, setSessionFinished] = useState(false)

  // Answered State
  const [answeredState, setAnsweredState] = useState<{
    isCorrect: boolean
    explanation: string
    revisionTip: string
    correctAnswer: string
    nextDiff: 'easy' | 'medium' | 'hard'
    adaptationNotice: string
  } | null>(null)

  // Hints
  const [hintRevealed, setHintRevealed] = useState(false)
  const [hintsUsedThisQ, setHintsUsedThisQ] = useState(0)

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const timerRef = useRef<any>(null)

  // Initialize or re-initialize session when topic changes
  useEffect(() => {
    const initDiff = determineInitialDifficulty(currentTopicMeta.name)
    setCurrentDifficulty(initDiff)
    setSessionAttempts([])
    setAnsweredState(null)
    setSelectedOption(null)
    setHintRevealed(false)
    setHintsUsedThisQ(0)
    setSecondsElapsed(0)
    setQuestionStartTime(Date.now())
    setSessionFinished(false)

    // Select first question
    const firstQ = selectUnusedQuestion(selectedTopicId, initDiff, [])
    if (firstQ) {
      setCurrentQuestion(firstQ)
      setUsedQuestionIds([firstQ.id])
      setCurrentDifficulty(firstQ.difficulty)
    }
  }, [selectedTopicId])

  // Per-question timer loop
  useEffect(() => {
    if (answeredState || sessionFinished) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setSecondsElapsed(s => s + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [answeredState, sessionFinished, currentQuestion?.id])

  // ── Hint Toggle ─────────────────────────────────────────────────────────────
  const handleRevealHint = () => {
    if (!hintRevealed) {
      setHintRevealed(true)
      setHintsUsedThisQ(h => h + 1)
    } else {
      setHintRevealed(false)
    }
  }

  // ── Submit Current Answer ───────────────────────────────────────────────────
  const handleSubmitAnswer = () => {
    if (!currentQuestion || !selectedOption || answeredState) return

    const isCorrect = selectedOption === currentQuestion.correctAnswer
    const timeTaken = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000))

    // ── Activity Agent Adaptive Engine ────────────────────────────────────────
    let nextDiff: 'easy' | 'medium' | 'hard' = currentDifficulty
    let adaptationNotice = ''

    if (isCorrect) {
      if (currentDifficulty === 'easy') {
        nextDiff = 'medium'
        adaptationNotice = '🎯 Correct! Activity Agent has elevated difficulty to Medium.'
      } else if (currentDifficulty === 'medium') {
        nextDiff = 'hard'
        adaptationNotice = '🔥 Strong analytical accuracy! Activity Agent has scaled difficulty to Hard.'
      } else {
        nextDiff = 'hard'
        adaptationNotice = '🏆 Exceptional mastery! Retaining Hard difficulty challenge tier.'
      }
    } else {
      if (currentDifficulty === 'hard') {
        nextDiff = 'medium'
        adaptationNotice = '💡 Calibrating difficulty: Stepping down to Medium for solid conceptual foundation.'
      } else if (currentDifficulty === 'medium') {
        nextDiff = 'easy'
        adaptationNotice = '📚 Concept gap detected: Scaling to Easy with reinforced revision notes.'
      } else {
        nextDiff = 'easy'
        adaptationNotice = '⚠️ Reviewing core principles: Retaining Easy with foundational breakdown.'
      }
    }

    const attemptRecord: AttemptRecord = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.question,
      topic: currentQuestion.topicName,
      difficulty: currentQuestion.difficulty,
      selectedAnswer: selectedOption,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeTaken,
      hintsUsed: hintsUsedThisQ,
      attemptsCount: 1,
    }

    // 1. Synchronously set answered state so UI feedback appears instantly!
    setAnsweredState({
      isCorrect,
      explanation: currentQuestion.explanation,
      revisionTip: currentQuestion.revisionTip,
      correctAnswer: currentQuestion.correctAnswer,
      nextDiff,
      adaptationNotice,
    })

    // 2. Append attempt record
    setSessionAttempts(prev => [...prev, attemptRecord])

    // 3. Asynchronously persist to Supabase in background
    if (user) {
      saveAttemptToSupabase(attemptRecord, nextDiff)
    }
  }

  // Background Supabase persistence helper
  const saveAttemptToSupabase = async (
    attempt: AttemptRecord,
    nextDiff: 'easy' | 'medium' | 'hard'
  ) => {
    try {
      let topicUuid = topicDbMap[selectedTopicId] || topicDbMap[attempt.topic.toLowerCase()]
      if (!topicUuid) {
        const { data: dbTopic } = await supabase
          .from('topics')
          .select('id')
          .or(`slug.eq.${selectedTopicId},name.ilike.%${attempt.topic}%`)
          .maybeSingle()
        topicUuid = dbTopic?.id
      }

      if (topicUuid && user) {
        // A. Insert into activity_attempts
        await supabase.from('activity_attempts').insert({
          user_id: user.id,
          topic_id: topicUuid,
          question: attempt.questionText,
          difficulty: attempt.difficulty,
          question_type: 'mcq',
          user_answer: attempt.selectedAnswer,
          correct_answer: attempt.correctAnswer,
          is_correct: attempt.isCorrect,
          time_taken: attempt.timeTaken,
          hints_used: attempt.hintsUsed,
          attempts: 1,
        })

        // B. Update learning_progress
        const weight = attempt.difficulty === 'hard' ? 25 : attempt.difficulty === 'medium' ? 15 : 10
        const pointDelta = attempt.isCorrect ? weight : -5

        const { data: existingProgress } = await supabase
          .from('learning_progress')
          .select('id, progress_percentage, mastery_score')
          .eq('user_id', user.id)
          .eq('topic_id', topicUuid)
          .maybeSingle()

        const prevMastery = existingProgress?.mastery_score || 45
        const prevProgress = existingProgress?.progress_percentage || 50

        const newMastery = Math.min(100, Math.max(10, prevMastery + pointDelta))
        const newProgress = Math.min(100, Math.max(prevProgress, prevProgress + 10))

        await supabase.from('learning_progress').upsert(
          {
            user_id: user.id,
            topic_id: topicUuid,
            progress_percentage: newProgress,
            mastery_score: newMastery,
            completed: newMastery >= 80,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,topic_id' }
        )

        // C. Log event to learner_behaviour
        await supabase.from('learner_behaviour').insert({
          user_id: user.id,
          topic_id: topicUuid,
          event_type: attempt.isCorrect ? 'practice_correct' : 'practice_mistake',
          event_data: {
            topic: attempt.topic,
            difficulty: attempt.difficulty,
            next_difficulty: nextDiff,
            time_taken: attempt.timeTaken,
            hints_used: attempt.hintsUsed,
          },
        })
      }
    } catch (err) {
      console.error('Error saving practice attempt to Supabase:', err)
    }
  }

  // ── Next Adaptive Question ──────────────────────────────────────────────────
  const handleNextQuestion = () => {
    if (!answeredState) return

    // Cap practice set at 5 questions for session review
    if (sessionAttempts.length >= 5) {
      setSessionFinished(true)
      return
    }

    const targetDifficulty = answeredState.nextDiff

    // Select next UNUSED question from current topic
    const nextQ = selectUnusedQuestion(selectedTopicId, targetDifficulty, usedQuestionIds)

    if (!nextQ) {
      // All questions for this topic have been used in this session -> finish session
      setSessionFinished(true)
      return
    }

    // Reset answer & question state
    setCurrentQuestion(nextQ)
    setUsedQuestionIds(prev => [...prev, nextQ.id])
    setCurrentDifficulty(nextQ.difficulty)
    setSelectedOption(null)
    setAnsweredState(null)
    setHintRevealed(false)
    setHintsUsedThisQ(0)
    setSecondsElapsed(0)
    setQuestionStartTime(Date.now())
  }

  // ── Session Metrics ─────────────────────────────────────────────────────────
  const totalAnswered = sessionAttempts.length
  const totalCorrect = sessionAttempts.filter(a => a.isCorrect).length
  const accuracyPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const totalTimeTaken = sessionAttempts.reduce((acc, a) => acc + a.timeTaken, 0)
  const avgTimeTaken = totalAnswered > 0 ? Math.round(totalTimeTaken / totalAnswered) : 0
  const totalHintsUsed = sessionAttempts.reduce((acc, a) => acc + a.hintsUsed, 0)

  const diffBadge = currentQuestion ? difficultyBadge(currentQuestion.difficulty) : difficultyBadge('medium')

  return (
    <div className="min-h-screen bg-navy-50 text-navy-900 pb-20">
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-navy-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="p-2 rounded-xl text-navy-500 hover:text-navy-900 hover:bg-navy-100 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                  Step 12 · Activity Agent
                </span>
                <span className="hidden sm:inline text-xs text-navy-400">·</span>
                <span className="hidden sm:inline text-xs text-navy-500 font-medium">Personalized Practice</span>
              </div>
              <h1 className="text-base font-bold text-navy-900 truncate">
                Adaptive DSA Practice
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Topic Selector */}
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="text-xs font-semibold bg-navy-50 border border-navy-200 text-navy-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            >
              {topicsList.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onBackToDashboard}
              className="btn-secondary text-xs px-3.5 py-2 hidden sm:flex items-center gap-1.5"
            >
              Exit Practice
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Container ──────────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* Topic & Diagnostic Calibration Banner */}
        <div className="mb-6 bg-white border border-navy-200 rounded-2xl p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-navy-900">
                  Topic: {currentTopicMeta.name}
                </h2>
                <span className="text-[11px] text-navy-500">({currentTopicMeta.category})</span>
              </div>
              <p className="text-xs text-navy-500 mt-0.5">
                Calibrated against your diagnostic baseline. Questions adapt based on real-time accuracy and attempts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-navy-500 font-medium">Session Progress:</span>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
              {totalAnswered} / 5 Questions
            </span>
          </div>
        </div>

        {/* ── Session Summary Screen (when finished) ────────────────── */}
        {sessionFinished ? (
          <div className="bg-white border border-navy-200 rounded-2xl p-6 sm:p-8 shadow-card animate-fade-in space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-4">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-navy-900">
                Practice Session Completed!
              </h2>
              <p className="text-xs text-navy-500 mt-1">
                You have completed your personalized practice session for <strong>{currentTopicMeta.name}</strong>. All results have been synchronized to Supabase.
              </p>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-navy-50 rounded-xl border border-navy-200 text-center">
                <div className="text-2xl font-black text-brand-600">{accuracyPct}%</div>
                <div className="text-[11px] font-semibold text-navy-500 mt-0.5">Accuracy</div>
                <div className="text-[10px] text-navy-400 mt-0.5">{totalCorrect} of {totalAnswered} correct</div>
              </div>

              <div className="p-4 bg-navy-50 rounded-xl border border-navy-200 text-center">
                <div className="text-2xl font-black text-emerald-600">{totalCorrect}</div>
                <div className="text-[11px] font-semibold text-navy-500 mt-0.5">Correct Answers</div>
                <div className="text-[10px] text-navy-400 mt-0.5">{totalAnswered - totalCorrect} incorrect</div>
              </div>

              <div className="p-4 bg-navy-50 rounded-xl border border-navy-200 text-center">
                <div className="text-2xl font-black text-navy-800">{avgTimeTaken}s</div>
                <div className="text-[11px] font-semibold text-navy-500 mt-0.5">Avg Time / Q</div>
                <div className="text-[10px] text-navy-400 mt-0.5">{totalTimeTaken}s total</div>
              </div>

              <div className="p-4 bg-navy-50 rounded-xl border border-navy-200 text-center">
                <div className="text-2xl font-black text-amber-600">{totalHintsUsed}</div>
                <div className="text-[11px] font-semibold text-navy-500 mt-0.5">Hints Requested</div>
                <div className="text-[10px] text-navy-400 mt-0.5">Active guidance</div>
              </div>
            </div>

            {/* Attempts Breakdown Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-600 mb-3">
                Question Performance Breakdown
              </h3>
              <div className="space-y-2">
                {sessionAttempts.map((att, idx) => {
                  const b = difficultyBadge(att.difficulty)
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-navy-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {att.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        )}
                        <span className="font-semibold text-navy-800 truncate">
                          Q{idx + 1}: {att.questionText}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.bg}`}>
                          {b.label}
                        </span>
                        <span className="text-navy-500 text-[11px]">{att.timeTaken}s</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-navy-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const initDiff = determineInitialDifficulty(currentTopicMeta.name)
                  setSessionAttempts([])
                  setSessionFinished(false)
                  setAnsweredState(null)
                  setSelectedOption(null)
                  setHintRevealed(false)
                  setHintsUsedThisQ(0)
                  setSecondsElapsed(0)
                  setQuestionStartTime(Date.now())
                  const firstQ = selectUnusedQuestion(selectedTopicId, initDiff, [])
                  if (firstQ) {
                    setCurrentQuestion(firstQ)
                    setUsedQuestionIds([firstQ.id])
                    setCurrentDifficulty(firstQ.difficulty)
                  }
                }}
                className="btn-secondary text-xs px-4 py-2.5 w-full sm:w-auto justify-center flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Practice Again
              </button>

              {onOpenLearningTopic && (
                <button
                  type="button"
                  onClick={() => onOpenLearningTopic(selectedTopicId)}
                  className="btn-secondary text-xs px-4 py-2.5 w-full sm:w-auto justify-center flex items-center gap-2 text-brand-600"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Review {currentTopicMeta.name} Lesson
                </button>
              )}

              <button
                type="button"
                onClick={onBackToDashboard}
                className="btn-primary text-xs px-5 py-2.5 w-full sm:w-auto justify-center flex items-center gap-2"
              >
                Return to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* ── Active Practice Card ────────────────────────────────── */
          <div className="space-y-6">
            {currentQuestion && (
              <div className="bg-white border border-navy-200 rounded-2xl shadow-card overflow-hidden">
                {/* Question Card Header */}
                <div className="p-5 sm:p-6 border-b border-navy-100 flex flex-wrap items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-navy-400">
                      Question #{sessionAttempts.length + 1}
                    </span>
                    <span className="text-navy-300">·</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${diffBadge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${diffBadge.dot} animate-pulse`} />
                      {diffBadge.label}
                    </span>
                    <span className="text-navy-300">·</span>
                    <span className="text-xs font-semibold text-navy-600">
                      {currentQuestion.topicName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-navy-600">
                    <div className="flex items-center gap-1 text-navy-500">
                      <Clock className="w-4 h-4 text-navy-400" />
                      <span>{Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRevealHint}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                        hintRevealed
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>{hintRevealed ? 'Hide Hint' : 'Show Hint'}</span>
                    </button>
                  </div>
                </div>

                {/* Adaptive Hint Expandable Box */}
                {hintRevealed && (
                  <div className="px-5 sm:px-6 py-3.5 bg-amber-50/70 border-b border-amber-200/80 animate-fade-in flex items-start gap-3">
                    <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 leading-relaxed">
                      <strong className="font-semibold text-amber-950">Adaptive Clue: </strong>
                      {currentQuestion.hint}
                    </div>
                  </div>
                )}

                {/* Question Body */}
                <div className="p-5 sm:p-8 space-y-6">
                  <h3 className="text-base sm:text-lg font-bold text-navy-900 leading-relaxed">
                    {currentQuestion.question}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                      const letter = String.fromCharCode(65 + idx)
                      const isSelected = selectedOption === option
                      const isAnswered = answeredState !== null
                      const isCorrectChoice = option === currentQuestion.correctAnswer
                      const isUserIncorrectSelection = isAnswered && isSelected && !answeredState.isCorrect

                      let containerStyle = 'bg-white border-navy-200 hover:border-brand-300 hover:bg-navy-50/50 cursor-pointer'
                      let badgeStyle = 'bg-navy-100 text-navy-700'
                      let labelBadge = null

                      if (isAnswered) {
                        if (isCorrectChoice) {
                          // Correct answer is ALWAYS clearly green
                          containerStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30'
                          badgeStyle = 'bg-emerald-600 text-white font-bold'
                          labelBadge = (
                            <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              <Check className="w-3.5 h-3.5" />
                              Correct Answer
                            </span>
                          )
                        } else if (isUserIncorrectSelection) {
                          // User's wrong selection is clearly RED
                          containerStyle = 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/30'
                          badgeStyle = 'bg-rose-600 text-white font-bold'
                          labelBadge = (
                            <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
                              <X className="w-3.5 h-3.5" />
                              Your Selection
                            </span>
                          )
                        } else {
                          // Other neutral options are disabled/faded
                          containerStyle = 'bg-navy-50/30 border-navy-200 opacity-50 cursor-not-allowed'
                          badgeStyle = 'bg-navy-100 text-navy-500'
                        }
                      } else if (isSelected) {
                        containerStyle = 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/20'
                        badgeStyle = 'bg-brand-600 text-white'
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => setSelectedOption(option)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3.5 ${containerStyle}`}
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${badgeStyle}`}>
                            {letter}
                          </span>
                          <span className="text-xs sm:text-sm text-navy-800 leading-relaxed font-medium flex-1">
                            {option}
                          </span>
                          {labelBadge}
                        </button>
                      )
                    })}
                  </div>

                  {/* Submission Button */}
                  {!answeredState && (
                    <div className="pt-4 border-t border-navy-100 flex items-center justify-between gap-4">
                      <div className="text-xs text-navy-400">
                        {selectedOption ? 'Option selected. Click Submit Answer to verify.' : 'Select an option to submit'}
                      </div>
                      <button
                        type="button"
                        disabled={!selectedOption}
                        onClick={handleSubmitAnswer}
                        className="btn-primary text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                      >
                        <span>Submit Answer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* ── Post-Answer Review & Explanation Drawer ──────────────── */}
                  {answeredState && (
                    <div className="mt-6 pt-6 border-t border-navy-200 space-y-4 animate-fade-in">
                      {/* Result Banner */}
                      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                        answeredState.isCorrect
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}>
                        {answeredState.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="text-xs leading-relaxed">
                          <strong className="font-bold text-sm block mb-1">
                            {answeredState.isCorrect ? '✓ Correct Answer!' : '✗ Incorrect Attempt'}
                          </strong>
                          {answeredState.isCorrect ? (
                            <span>Well done! Your answer aligns directly with the underlying algorithmic principle.</span>
                          ) : (
                            <span>
                              The correct answer is: <strong>{answeredState.correctAnswer}</strong>. Review the explanation below to reinforce your understanding.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Explanation Card */}
                      <div className="p-4 bg-navy-50 rounded-xl border border-navy-200 text-xs text-navy-700 leading-relaxed space-y-2">
                        <div className="font-bold text-navy-900 flex items-center gap-1.5">
                          <Brain className="w-4 h-4 text-brand-600" />
                          <span>Analytical Explanation:</span>
                        </div>
                        <p>{answeredState.explanation}</p>
                      </div>

                      {/* Adaptive Revision Rule (Displayed on incorrect answers) */}
                      {!answeredState.isCorrect && (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-1">
                          <div className="font-bold text-amber-950 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-600" />
                            <span>Adaptive Revision Rule:</span>
                          </div>
                          <p>{answeredState.revisionTip}</p>
                        </div>
                      )}

                      {/* Activity Agent Adaptation Notice */}
                      <div className="p-3 bg-brand-50/80 rounded-xl border border-brand-200 text-xs text-brand-900 flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
                        <span className="font-medium">{answeredState.adaptationNotice}</span>
                      </div>

                      {/* Next / Finish Button */}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setSessionFinished(true)}
                          className="btn-secondary text-xs px-4 py-2 cursor-pointer"
                        >
                          Finish Session Early
                        </button>

                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="btn-primary text-xs font-bold px-6 py-2.5 rounded-xl shadow flex items-center gap-2 cursor-pointer"
                        >
                          <span>Next Adaptive Question</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
