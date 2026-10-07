import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { PREDEFINED_PRACTICE_QUESTIONS, type PracticeQuestion } from '../data/practiceQuestions'
import { PREDEFINED_LEARNING_TOPICS } from '../data/learningContent'
import { shuffleArray } from '../utils/shuffle'
import {
  Brain, Zap, Clock, Lightbulb, CheckCircle2, XCircle,
  ArrowRight, ArrowLeft, RefreshCw, Award, Sparkles,
  BookOpen, Check, X, ShieldCheck, Flame,
  AlertTriangle, Compass
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

interface AnsweredState {
  isCorrect: boolean
  explanation: string
  revisionTip: string
  correctAnswer: string
  nextDiff: 'easy' | 'medium' | 'hard'
  adaptationNotice: string
  adaptationReason: string
  ruleTriggered: 'repeated_mistakes' | 'low_accuracy' | 'high_performance' | 'good_accuracy' | 'slow_completion'
  isSlowCompletion: boolean
  isRepeatedMistake: boolean
  learnerModelUpdated: boolean
  learnerModelNotice?: string
  interestAnalogy?: {
    title: string
    narrative: string
    mappingText: string
  }
  stepByStepTip?: string
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
  const { user, learnerProfile, setProfileLocally } = useAuth()

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
  const activeLearningTopic = PREDEFINED_LEARNING_TOPICS.find(
    t => t.id === selectedTopicId || t.name.toLowerCase() === selectedTopicId.toLowerCase()
  )

  // Learner profile attributes
  const userInterestKey = learnerProfile?.interests?.[0] || 'railway'

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

  // ── Adaptive State Tracking ─────────────────────────────────────────────────
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'hard'>(() => {
    return determineInitialDifficulty(currentTopicMeta.name)
  })

  // Session-level behavioral counters for Step 13 Adaptation Logic
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0)
  const [consecutiveMistakes, setConsecutiveMistakes] = useState<number>(0)
  const [topicMistakes, setTopicMistakes] = useState<number>(0)
  const [topicCorrect, setTopicCorrect] = useState<number>(0)
  const [topicMastery, setTopicMastery] = useState<number>(55)

  // Track question IDs already presented in the current session
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [sessionAttempts, setSessionAttempts] = useState<AttemptRecord[]>([])
  const [sessionFinished, setSessionFinished] = useState(false)

  // Answered State
  const [answeredState, setAnsweredState] = useState<AnsweredState | null>(null)

  // Hints
  const [hintRevealed, setHintRevealed] = useState(false)
  const [hintsUsedThisQ, setHintsUsedThisQ] = useState(0)

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const timerRef = useRef<any>(null)

  // Fetch initial mastery from Supabase when topic changes
  useEffect(() => {
    async function loadMastery() {
      if (!user) return
      const topicUuid = topicDbMap[selectedTopicId] || topicDbMap[currentTopicMeta.name.toLowerCase()]
      if (topicUuid) {
        const { data } = await supabase
          .from('learning_progress')
          .select('mastery_score')
          .eq('user_id', user.id)
          .eq('topic_id', topicUuid)
          .maybeSingle()
        if (data?.mastery_score) {
          setTopicMastery(data.mastery_score)
        }
      }
    }
    loadMastery()
  }, [selectedTopicId, topicDbMap, user])

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

    // Reset behavioral counters on topic switch
    setConsecutiveCorrect(0)
    setConsecutiveMistakes(0)
    setTopicMistakes(0)
    setTopicCorrect(0)

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

  // ── Submit Current Answer with Step 13 Adaptive Engine ──────────────────────
  const handleSubmitAnswer = () => {
    if (!currentQuestion || !selectedOption || answeredState) return

    const isCorrect = selectedOption === currentQuestion.correctAnswer
    const timeTaken = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000))

    // Update session behavioral counters
    const nextConsecutiveCorrect = isCorrect ? consecutiveCorrect + 1 : 0
    const nextConsecutiveMistakes = !isCorrect ? consecutiveMistakes + 1 : 0
    const nextTopicMistakes = !isCorrect ? topicMistakes + 1 : topicMistakes
    const nextTopicCorrect = isCorrect ? topicCorrect + 1 : topicCorrect

    setConsecutiveCorrect(nextConsecutiveCorrect)
    setConsecutiveMistakes(nextConsecutiveMistakes)
    setTopicMistakes(nextTopicMistakes)
    setTopicCorrect(nextTopicCorrect)

    // Dynamic Mastery Score Update
    const pointWeight = currentDifficulty === 'hard' ? 20 : currentDifficulty === 'medium' ? 15 : 10
    const pointDelta = isCorrect ? pointWeight : -6
    const updatedMastery = Math.min(100, Math.max(10, topicMastery + pointDelta))
    setTopicMastery(updatedMastery)

    // ── STEP 13 ADAPTIVE LEARNING ENGINE ──────────────────────────────────────
    let nextDiff: 'easy' | 'medium' | 'hard' = currentDifficulty
    let adaptationReason = ''
    let adaptationNotice = ''
    let ruleTriggered: 'repeated_mistakes' | 'low_accuracy' | 'high_performance' | 'good_accuracy' | 'slow_completion'
    let isSlowCompletion = false
    let isRepeatedMistake = false
    let stepByStepTip: string | undefined

    // Rule 1: Repeated mistakes on the same concept
    if (!isCorrect && (nextConsecutiveMistakes >= 2 || nextTopicMistakes >= 2)) {
      isRepeatedMistake = true
      ruleTriggered = 'repeated_mistakes'
      nextDiff = 'easy'
      adaptationReason = `You missed ${nextTopicMistakes} ${currentQuestion.topicName} questions, so we're giving you a simpler ${currentQuestion.topicName} problem to strengthen the concept.`
      adaptationNotice = `Concept gap identified in ${currentQuestion.topicName}. Difficulty adjusted to Easy with revision support.`
    }
    // Rule 2: Slow completion (taking >= 45 seconds)
    else if (timeTaken >= 45) {
      isSlowCompletion = true
      ruleTriggered = 'slow_completion'
      stepByStepTip = activeLearningTopic?.styleExplanations?.['step-by-step']?.body ||
        `Step 1: Identify given structure and constraints. Step 2: Trace invariants step-by-step. Step 3: Verify boundary conditions before concluding.`

      if (!isCorrect) {
        nextDiff = 'easy'
        adaptationReason = `You took ${timeTaken}s on this question. We recommend breaking down ${currentQuestion.topicName} step-by-step with foundational practice.`
        adaptationNotice = `Pace calibration: Took ${timeTaken}s. Shifting to Easy with step-by-step breakdown.`
      } else {
        nextDiff = currentDifficulty
        adaptationReason = `Correct answer, but completion took ${timeTaken}s. Maintaining ${currentDifficulty} difficulty to solidify procedural fluency.`
        adaptationNotice = `Procedural pacing: Retaining ${currentDifficulty} difficulty to build speed.`
      }
    }
    // Rule 3: Low accuracy (single mistake on current difficulty tier)
    else if (!isCorrect) {
      ruleTriggered = 'low_accuracy'
      if (currentDifficulty === 'hard') nextDiff = 'medium'
      else if (currentDifficulty === 'medium') nextDiff = 'easy'
      else nextDiff = 'easy'

      adaptationReason = `Incorrect attempt on ${currentDifficulty} difficulty. Calibrating difficulty to ${nextDiff} to reinforce core principles.`
      adaptationNotice = `Calibrating difficulty: Stepping down to ${nextDiff} for conceptual reinforcement.`
    }
    // Rule 4: High performance (2 or more consecutive correct answers)
    else if (nextConsecutiveCorrect >= 2) {
      ruleTriggered = 'high_performance'
      if (currentDifficulty === 'easy') nextDiff = 'medium'
      else if (currentDifficulty === 'medium') nextDiff = 'hard'
      else nextDiff = 'hard'

      adaptationReason = `High performance streak! ${nextConsecutiveCorrect} correct answers in a row on ${currentQuestion.topicName}. Recommending a harder question.`
      adaptationNotice = `High performance detected! Elevating difficulty to ${nextDiff}.`
    }
    // Rule 5: Good accuracy (first correct answer on tier)
    else {
      ruleTriggered = 'good_accuracy'
      if (currentDifficulty === 'easy') {
        nextDiff = 'medium'
        adaptationReason = `Good accuracy! Foundational understanding confirmed. Transitioning to Medium.`
        adaptationNotice = `Foundations verified. Progressing to Medium.`
      } else {
        nextDiff = currentDifficulty
        adaptationReason = `Solid analytical reasoning! Maintaining ${currentDifficulty} to confirm topic mastery.`
        adaptationNotice = `Analytical accuracy confirmed. Maintaining ${currentDifficulty}.`
      }
    }

    // ── Learner Interest Contextual Analogy Bridge ────────────────────────────
    let interestAnalogy: { title: string; narrative: string; mappingText: string } | undefined
    if (activeLearningTopic?.interestAnalogies?.[userInterestKey]) {
      const aData = activeLearningTopic.interestAnalogies[userInterestKey]
      const mapItem = aData.mapping?.[0]
      interestAnalogy = {
        title: aData.title,
        narrative: aData.narrative,
        mappingText: mapItem ? `${mapItem.term} maps to ${mapItem.dsaConcept} (${mapItem.meaning})` : aData.narrative,
      }
    }

    // ── Dynamic Learner Model Update (No Permanent Labels) ────────────────────
    const currentStrengths = learnerProfile?.strengths || []
    const currentNeedsPractice = learnerProfile?.needs_practice || []
    let learnerModelUpdated = false
    let learnerModelNotice = ''
    let updatedStrengths = [...currentStrengths]
    let updatedNeedsPractice = [...currentNeedsPractice]

    // Promotion: If user proves mastery with 2+ correct answers and zero mistakes
    if (nextTopicCorrect >= 2 && nextTopicMistakes === 0) {
      if (updatedNeedsPractice.includes(currentQuestion.topicName)) {
        updatedNeedsPractice = updatedNeedsPractice.filter(t => t !== currentQuestion.topicName)
        learnerModelUpdated = true
      }
      if (!updatedStrengths.includes(currentQuestion.topicName)) {
        updatedStrengths.push(currentQuestion.topicName)
        learnerModelUpdated = true
      }
      if (learnerModelUpdated) {
        learnerModelNotice = `🎉 Dynamic Learner Model: ${currentQuestion.topicName} graduated from 'Needs Practice' to 'Active Strength'!`
      }
    }

    // Calibration: If user struggles with 2+ mistakes
    if (nextTopicMistakes >= 2 && (nextTopicCorrect / (nextTopicCorrect + nextTopicMistakes)) < 0.5) {
      if (updatedStrengths.includes(currentQuestion.topicName)) {
        updatedStrengths = updatedStrengths.filter(t => t !== currentQuestion.topicName)
        learnerModelUpdated = true
      }
      if (!updatedNeedsPractice.includes(currentQuestion.topicName)) {
        updatedNeedsPractice.push(currentQuestion.topicName)
        learnerModelUpdated = true
      }
      if (learnerModelUpdated) {
        learnerModelNotice = `🔄 Dynamic Learner Model: ${currentQuestion.topicName} calibrated to 'Needs Practice' for foundational reinforcement.`
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

    // Synchronously set answered state so UI feedback appears instantly!
    setAnsweredState({
      isCorrect,
      explanation: currentQuestion.explanation,
      revisionTip: currentQuestion.revisionTip,
      correctAnswer: currentQuestion.correctAnswer,
      nextDiff,
      adaptationNotice,
      adaptationReason,
      ruleTriggered,
      isSlowCompletion,
      isRepeatedMistake,
      learnerModelUpdated,
      learnerModelNotice,
      interestAnalogy,
      stepByStepTip,
    })

    // Append attempt record
    setSessionAttempts(prev => [...prev, attemptRecord])

    // Update dynamic learner profile locally
    if (learnerModelUpdated && learnerProfile) {
      setProfileLocally({
        ...learnerProfile,
        strengths: updatedStrengths,
        needs_practice: updatedNeedsPractice,
      })
    }

    // Persist all updates to Supabase in background
    if (user) {
      saveAttemptToSupabase(
        attemptRecord,
        nextDiff,
        adaptationReason,
        updatedMastery,
        learnerModelUpdated,
        updatedStrengths,
        updatedNeedsPractice
      )
    }
  }

  // Background Supabase persistence helper
  const saveAttemptToSupabase = async (
    attempt: AttemptRecord,
    nextDiff: 'easy' | 'medium' | 'hard',
    adaptationReason: string,
    newMasteryScore: number,
    modelUpdated: boolean,
    newStrengths: string[],
    newNeedsPractice: string[]
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
        const { data: existingProgress } = await supabase
          .from('learning_progress')
          .select('id, progress_percentage')
          .eq('user_id', user.id)
          .eq('topic_id', topicUuid)
          .maybeSingle()

        const prevProgress = existingProgress?.progress_percentage || 50
        const newProgress = Math.min(100, Math.max(prevProgress, prevProgress + 10))

        await supabase.from('learning_progress').upsert(
          {
            user_id: user.id,
            topic_id: topicUuid,
            progress_percentage: newProgress,
            mastery_score: newMasteryScore,
            completed: newMasteryScore >= 80,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,topic_id' }
        )

        // C. Update learner_profiles if model was updated
        if (modelUpdated) {
          await supabase.from('learner_profiles').update({
            strengths: newStrengths,
            needs_practice: newNeedsPractice,
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id)
        }

        // D. Log adaptive decision to learner_behaviour
        await supabase.from('learner_behaviour').insert({
          user_id: user.id,
          topic_id: topicUuid,
          event_type: 'adaptive_decision',
          event_data: {
            topic: attempt.topic,
            previous_difficulty: attempt.difficulty,
            next_difficulty: nextDiff,
            adaptation_reason: adaptationReason,
            time_taken: attempt.timeTaken,
            hints_used: attempt.hintsUsed,
            is_correct: attempt.isCorrect,
            model_updated: modelUpdated,
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
                  Step 13 · Adaptive Learning Engine
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
        {/* Topic & Diagnostic Calibration Banner with Real-time Adaptive Signals */}
        <div className="mb-6 bg-white border border-navy-200 rounded-2xl p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-navy-900">
                  Topic: {currentTopicMeta.name}
                </h2>
                <span className="text-[11px] text-navy-500">({currentTopicMeta.category})</span>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                  {topicMastery}% Mastery
                </span>
                {consecutiveCorrect >= 2 && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" />
                    {consecutiveCorrect} Streak
                  </span>
                )}
                {consecutiveMistakes >= 2 && (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    Concept Gap Detected
                  </span>
                )}
              </div>
              <p className="text-xs text-navy-500 mt-0.5">
                Calibrated against your diagnostic profile & practice behaviour. Questions adapt dynamically to accuracy and pace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <span className="text-xs text-navy-500 font-medium">Session:</span>
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
                You completed your adaptive practice session for <strong>{currentTopicMeta.name}</strong>. Dynamic mastery has been recalibrated and stored in Supabase.
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
                <div className="text-2xl font-black text-emerald-600">{topicMastery}%</div>
                <div className="text-[11px] font-semibold text-navy-500 mt-0.5">Updated Mastery</div>
                <div className="text-[10px] text-navy-400 mt-0.5">{topicMastery >= 80 ? 'Mastery Achieved!' : `${80 - topicMastery}% to certificate`}</div>
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
                  setConsecutiveCorrect(0)
                  setConsecutiveMistakes(0)
                  setTopicMistakes(0)
                  setTopicCorrect(0)
                  const firstQ = selectUnusedQuestion(selectedTopicId, initDiff, [])
                  if (firstQ) {
                    setCurrentQuestion(firstQ)
                    setUsedQuestionIds([firstQ.id])
                    setCurrentDifficulty(firstQ.difficulty)
                  }
                }}
                className="btn-secondary text-xs px-4 py-2.5 w-full sm:w-auto justify-center flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Practice Again
              </button>

              {onOpenLearningTopic && (
                <button
                  type="button"
                  onClick={() => onOpenLearningTopic(selectedTopicId)}
                  className="btn-secondary text-xs px-4 py-2.5 w-full sm:w-auto justify-center flex items-center gap-2 text-brand-600 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Review {currentTopicMeta.name} Lesson
                </button>
              )}

              <button
                type="button"
                onClick={onBackToDashboard}
                className="btn-primary text-xs px-5 py-2.5 w-full sm:w-auto justify-center flex items-center gap-2 cursor-pointer"
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
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
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
                      {/* 1. Result Banner */}
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
                              The correct answer is: <strong>{answeredState.correctAnswer}</strong>. Review the explanation and adaptive recommendations below.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 2. Clear Understandable Reason for Adaptation (PRD Step 13) */}
                      <div className="p-4 bg-brand-50/90 rounded-xl border border-brand-200 text-xs text-brand-950 space-y-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
                          <span className="font-bold uppercase tracking-wider text-[11px] text-brand-700">
                            Adaptive Decision · Activity Agent
                          </span>
                        </div>
                        <p className="font-semibold text-brand-900 text-sm leading-snug">
                          "{answeredState.adaptationReason}"
                        </p>
                      </div>

                      {/* 3. Dynamic Learner Model Update Notification (No Permanent Labeling) */}
                      {answeredState.learnerModelUpdated && (
                        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5 animate-scale-up">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="font-semibold">{answeredState.learnerModelNotice}</span>
                        </div>
                      )}

                      {/* 4. Learner Interest-Tailored Analogy Bridge */}
                      {answeredState.interestAnalogy && (
                        <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-950 space-y-1.5">
                          <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                            <Compass className="w-4 h-4 text-indigo-600" />
                            <span>Relatable {answeredState.interestAnalogy.title} Analogy:</span>
                          </div>
                          <p className="text-indigo-800 leading-relaxed">
                            {answeredState.interestAnalogy.narrative}
                          </p>
                          <div className="text-[11px] font-semibold text-indigo-900 bg-white/80 p-2 rounded-lg border border-indigo-100">
                            <strong>Concept Bridge:</strong> {answeredState.interestAnalogy.mappingText}
                          </div>
                        </div>
                      )}

                      {/* 5. Step-by-Step Breakdown (Triggered on Slow Completion) */}
                      {answeredState.isSlowCompletion && answeredState.stepByStepTip && (
                        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1.5">
                          <div className="font-bold text-amber-900 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span>Procedural Step-by-Step Breakdown (Slow Completion):</span>
                          </div>
                          <p className="text-amber-800 leading-relaxed whitespace-pre-line">
                            {answeredState.stepByStepTip}
                          </p>
                        </div>
                      )}

                      {/* 6. Adaptive Revision Rule & Lesson Review Action */}
                      {(!answeredState.isCorrect || answeredState.isRepeatedMistake) && (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed space-y-2">
                          <div className="font-bold text-amber-950 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Lightbulb className="w-4 h-4 text-amber-600" />
                              <span>Adaptive Revision Rule:</span>
                            </div>
                            {onOpenLearningTopic && (
                              <button
                                type="button"
                                onClick={() => onOpenLearningTopic(selectedTopicId)}
                                className="text-[11px] font-bold text-brand-700 bg-white border border-brand-200 px-2.5 py-1 rounded-lg hover:bg-brand-50 flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                                <span>Review {currentQuestion.topicName} Lesson</span>
                              </button>
                            )}
                          </div>
                          <p>{answeredState.revisionTip}</p>
                        </div>
                      )}

                      {/* 7. Analytical Explanation Card */}
                      <div className="p-4 bg-navy-50 rounded-xl border border-navy-200 text-xs text-navy-700 leading-relaxed space-y-2">
                        <div className="font-bold text-navy-900 flex items-center gap-1.5">
                          <Brain className="w-4 h-4 text-brand-600" />
                          <span>Analytical Explanation:</span>
                        </div>
                        <p>{answeredState.explanation}</p>
                      </div>

                      {/* 8. Next / Finish Buttons */}
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
