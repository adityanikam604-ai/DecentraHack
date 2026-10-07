import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { PREDEFINED_DIAGNOSTIC_QUESTIONS, type DiagnosticQuestion } from '../data/diagnosticQuestions'
import { shuffleArray } from '../utils/shuffle'
import type { LearnerProfile } from '../types'
import {
  Clock, Award, CheckCircle, AlertCircle, ArrowRight,
  ArrowLeft, ShieldCheck, ChevronDown, ChevronUp,
  XCircle, CheckCircle2
} from 'lucide-react'

interface QuestionAttempt {
  questionId: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  selectedAnswer: string | null
  correctAnswer: string
  isCorrect: boolean
  isSkipped: boolean
  timeTaken: number
  attemptsCount: number
  explanation: string
}

interface DiagnosticAssessmentProps {
  onComplete: () => void
  onExit: () => void
}

export default function DiagnosticAssessmentPage({ onComplete, onExit }: DiagnosticAssessmentProps) {
  const { user, learnerProfile, setProfileLocally } = useAuth()

  // Questions set (8 core PRD questions with independently shuffled options per session)
  const [questions] = useState<DiagnosticQuestion[]>(() =>
    PREDEFINED_DIAGNOSTIC_QUESTIONS.map(q => ({
      ...q,
      options: shuffleArray(q.options),
    }))
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({})
  const [attemptsTracker, setAttemptsTracker] = useState<Record<string, number>>({})
  const [skippedTracker, setSkippedTracker] = useState<Record<string, boolean>>({})

  // Running timers
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [currentQSeconds, setCurrentQSeconds] = useState(0)

  // Status: 'in_progress' | 'completed'
  const [isFinished, setIsFinished] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReview, setShowReview] = useState(false)

  // Results calculation
  const [finalScore, setFinalScore] = useState(0)
  const [diagnosedLevel, setDiagnosedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [detectedStrengths, setDetectedStrengths] = useState<string[]>([])
  const [detectedPractice, setDetectedPractice] = useState<string[]>([])
  const [attemptsList, setAttemptsList] = useState<QuestionAttempt[]>([])

  // Global timer
  useEffect(() => {
    if (isFinished) return
    const interval = setInterval(() => {
      setTotalSeconds(s => s + 1)
      setCurrentQSeconds(s => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isFinished])

  // Reset per-question timer when question index changes
  useEffect(() => {
    setCurrentQSeconds(0)
  }, [currentIndex])

  const currentQ = questions[currentIndex]

  // Track answer selection
  const handleSelectOption = (option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: option }))
    setAttemptsTracker(prev => ({
      ...prev,
      [currentQ.id]: (prev[currentQ.id] || 0) + 1,
    }))
    // If it was marked skipped, unmark it
    if (skippedTracker[currentQ.id]) {
      setSkippedTracker(prev => ({ ...prev, [currentQ.id]: false }))
    }
  }

  // Record time spent on current question before moving
  const recordCurrentQTime = () => {
    setQuestionTimes(prev => ({
      ...prev,
      [currentQ.id]: (prev[currentQ.id] || 0) + currentQSeconds,
    }))
  }

  // Skip question
  const handleSkipQuestion = () => {
    recordCurrentQTime()
    setSkippedTracker(prev => ({ ...prev, [currentQ.id]: true }))
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      finishAssessment()
    }
  }

  // Next or Submit
  const handleNextOrSubmit = () => {
    recordCurrentQTime()
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      finishAssessment()
    }
  }

  // Previous
  const handlePrevious = () => {
    recordCurrentQTime()
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }

  // Process & calculate results
  const finishAssessment = async () => {
    setIsSubmitting(true)

    // Build attempts breakdown
    let correctCount = 0
    const strengths: string[] = []
    const practice: string[] = []

    const compiledAttempts: QuestionAttempt[] = questions.map(q => {
      const selected = selectedAnswers[q.id] || null
      const isSkipped = !!skippedTracker[q.id] || selected === null
      const isCorrect = selected === q.correctAnswer
      const timeSpent = (questionTimes[q.id] || 0) + (q.id === currentQ.id ? currentQSeconds : 0)
      const attemptsCount = attemptsTracker[q.id] || (isSkipped ? 0 : 1)

      if (isCorrect) {
        correctCount++
        if (!strengths.includes(q.topic)) strengths.push(q.topic)
      } else {
        if (!practice.includes(q.topic)) practice.push(q.topic)
      }

      return {
        questionId: q.id,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        isSkipped,
        timeTaken: Math.max(1, timeSpent),
        attemptsCount,
        explanation: q.explanation,
      }
    })

    const scorePct = Math.round((correctCount / questions.length) * 100)

    // Diagnosed Knowledge Level
    let newLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
    if (scorePct >= 75) newLevel = 'advanced'
    else if (scorePct < 45) newLevel = 'beginner'

    const finalStrengths = strengths.length > 0 ? strengths : ['Arrays']
    const finalPractice = practice.length > 0 ? practice : ['Graphs', 'Trees']

    setFinalScore(scorePct)
    setDiagnosedLevel(newLevel)
    setDetectedStrengths(finalStrengths)
    setDetectedPractice(finalPractice)
    setAttemptsList(compiledAttempts)

    // Persist to Supabase
    if (user) {
      try {
        // 1. Get DSA subject ID
        const { data: dsaSubject } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', 'dsa')
          .maybeSingle()

        let subjectId = dsaSubject?.id
        if (!subjectId) {
          const { data: anySubject } = await supabase
            .from('subjects')
            .select('id')
            .limit(1)
            .maybeSingle()
          subjectId = anySubject?.id
        }

        if (subjectId) {
          // 2. Insert into assessments table
          const { data: assessmentRecord, error: aError } = await supabase
            .from('assessments')
            .insert({
              user_id: user.id,
              subject_id: subjectId,
              type: 'diagnostic',
              status: 'completed',
              total_score: scorePct,
              completed_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (!aError && assessmentRecord?.id) {
            // 3. Insert individual assessment_attempts
            const attemptRows = compiledAttempts.map(att => ({
              assessment_id: assessmentRecord.id,
              user_id: user.id,
              question: att.question,
              topic: att.topic,
              difficulty: att.difficulty,
              question_type: 'mcq',
              user_answer: att.selectedAnswer || 'SKIPPED',
              correct_answer: att.correctAnswer,
              is_correct: att.isCorrect,
              time_taken: att.timeTaken,
              hints_used: 0,
              attempts: att.attemptsCount,
            }))

            await supabase.from('assessment_attempts').insert(attemptRows)
          }
        }

        // 4. Update learner_profiles with diagnosed level, strengths, and areas needing practice
        const updatedProfile: LearnerProfile = {
          ...(learnerProfile || {
            user_id: user.id,
            education_level: 'undergraduate',
            interests: ['railway'],
            preferred_explanation: 'real-world examples',
            difficulty_preference: 'medium',
            learning_goals: 'Technical Placements & Mastery',
          }),
          user_id: user.id,
          current_level: newLevel,
          strengths: finalStrengths,
          needs_practice: finalPractice,
          updated_at: new Date().toISOString(),
        }

        await supabase
          .from('learner_profiles')
          .upsert(updatedProfile, { onConflict: 'user_id' })

        // 5. Update local context so Dashboard immediately reflects the diagnosis
        setProfileLocally(updatedProfile)

        // 6. Update topic-level learning_progress in Supabase
        const { data: dbTopics } = await supabase
          .from('topics')
          .select('id, name')

        if (dbTopics && dbTopics.length > 0) {
          const progressRows = dbTopics.map(t => {
            const isStr = finalStrengths.includes(t.name)
            const isPrac = finalPractice.includes(t.name)
            const pct = isStr ? 92 : isPrac ? 38 : 65
            const mastery = isStr ? 88 : isPrac ? 35 : 62
            return {
              user_id: user.id,
              topic_id: t.id,
              progress_percentage: pct,
              mastery_score: mastery,
              completed: isStr,
            }
          })

          await supabase
            .from('learning_progress')
            .upsert(progressRows, { onConflict: 'user_id,topic_id' })
        }
      } catch (err) {
        console.error('Error saving diagnostic assessment results:', err)
      }
    }

    setIsSubmitting(false)
    setIsFinished(true)
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: DIAGNOSTIC RESULTS SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  if (isFinished) {
    const correctCount = attemptsList.filter(a => a.isCorrect).length
    const skippedCount = attemptsList.filter(a => a.isSkipped).length
    const incorrectCount = attemptsList.length - correctCount - skippedCount

    return (
      <div className="min-h-screen bg-navy-50 flex flex-col justify-between">
        {/* Top bar */}
        <header className="bg-white border-b border-navy-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-transparent.png" alt="DecentralLearn" className="h-8 w-auto object-contain" />
              <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
                Diagnostic Complete
              </span>
            </div>
            <button
              onClick={onComplete}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              Continue to Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
          <div className="bg-white border border-navy-200 rounded-2xl shadow-card p-6 sm:p-10 mb-6">

            {/* Banner */}
            <div className="text-center mb-8 pb-8 border-b border-navy-100">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-100">
                <Award className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Initial Learner Diagnostic Completed!
              </h1>
              <p className="text-sm text-navy-500 mt-1 max-w-lg mx-auto">
                We have analyzed your accuracy, timing, and problem-solving attempts to formulate your starting learner model.
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-navy-50/70 border border-navy-200 rounded-xl p-4 text-center">
                <span className="text-xs font-semibold text-navy-500">Diagnostic Score</span>
                <div className="text-2xl font-black text-brand-600 mt-1">{finalScore}%</div>
                <span className="text-[11px] text-navy-400">{correctCount} of {questions.length} correct</span>
              </div>
              <div className="bg-navy-50/70 border border-navy-200 rounded-xl p-4 text-center">
                <span className="text-xs font-semibold text-navy-500">Diagnosed Level</span>
                <div className="text-2xl font-black text-navy-900 capitalize mt-1">{diagnosedLevel}</div>
                <span className="text-[11px] text-emerald-600 font-medium">Adaptive Baseline</span>
              </div>
              <div className="bg-navy-50/70 border border-navy-200 rounded-xl p-4 text-center">
                <span className="text-xs font-semibold text-navy-500">Total Time</span>
                <div className="text-2xl font-black text-navy-900 mt-1">{formatTime(totalSeconds)}</div>
                <span className="text-[11px] text-navy-400">Avg {Math.round(totalSeconds / questions.length)}s / question</span>
              </div>
              <div className="bg-navy-50/70 border border-navy-200 rounded-xl p-4 text-center">
                <span className="text-xs font-semibold text-navy-500">Completion</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
                <span className="text-[11px] text-navy-400">{skippedCount} skipped · {incorrectCount} incorrect</span>
              </div>
            </div>

            {/* Diagnosed Strengths & Practice Areas */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {/* Strengths */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                    Demonstrated Strengths
                  </h3>
                </div>
                <p className="text-xs text-emerald-800/80 mb-3">
                  You solved these topics accurately during the diagnostic:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedStrengths.map(topic => (
                    <span
                      key={topic}
                      className="text-xs font-bold bg-white text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg shadow-2xs"
                    >
                      ✓ {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Needs Practice */}
              <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">
                    Areas Needing Practice
                  </h3>
                </div>
                <p className="text-xs text-amber-800/80 mb-3">
                  Our adaptive engine will deliver guided explanations & focused questions here:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedPractice.map(topic => (
                    <span
                      key={topic}
                      className="text-xs font-bold bg-white text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg shadow-2xs"
                    >
                      ⚠ {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Toggle Detailed Question Review */}
            <div className="border-t border-navy-100 pt-6">
              <button
                type="button"
                onClick={() => setShowReview(!showReview)}
                className="w-full flex items-center justify-between text-sm font-bold text-navy-800 hover:text-brand-600 transition-colors p-2"
              >
                <span>Review Question-by-Question Breakdown ({attemptsList.length} questions)</span>
                {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showReview && (
                <div className="space-y-4 mt-4">
                  {attemptsList.map((att, idx) => (
                    <div
                      key={att.questionId}
                      className={`p-4 border rounded-xl text-xs ${
                        att.isCorrect
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : att.isSkipped
                          ? 'border-navy-200 bg-navy-50/40'
                          : 'border-red-200 bg-red-50/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-900">Q{idx + 1}. {att.topic}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase bg-white border border-navy-200">
                            {att.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-navy-400">⏱ {att.timeTaken}s</span>
                          {att.isCorrect ? (
                            <span className="flex items-center gap-1 font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                            </span>
                          ) : att.isSkipped ? (
                            <span className="font-bold text-navy-500">Skipped</span>
                          ) : (
                            <span className="flex items-center gap-1 font-bold text-red-600">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="font-medium text-navy-800 mb-2">{att.question}</p>

                      <div className="grid sm:grid-cols-2 gap-2 mb-2">
                        <div className="p-2 bg-white rounded border border-navy-200">
                          <span className="text-[10px] text-navy-400 block">Your Answer:</span>
                          <span className={att.isCorrect ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                            {att.selectedAnswer || '(Skipped)'}
                          </span>
                        </div>
                        <div className="p-2 bg-white rounded border border-navy-200">
                          <span className="text-[10px] text-navy-400 block">Correct Answer:</span>
                          <span className="text-emerald-700 font-bold">{att.correctAnswer}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-navy-600 bg-white/80 p-2 rounded border border-navy-100">
                        <strong>Explanation:</strong> {att.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Launch Dashboard Button */}
            <div className="mt-8 pt-6 border-t border-navy-100 text-center">
              <button
                type="button"
                onClick={onComplete}
                className="btn-primary px-8 py-3 text-sm font-bold inline-flex items-center gap-2"
              >
                Apply Diagnostic & Return to Dashboard <ShieldCheck className="w-4 h-4" />
              </button>
            </div>

          </div>
        </main>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // VIEW: SINGLE QUESTION AT A TIME ASSESSMENT
  // ─────────────────────────────────────────────────────────────────────────────
  const currentSelected = selectedAnswers[currentQ.id]
  const currentAttempts = attemptsTracker[currentQ.id] || 0
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100)

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col justify-between">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="bg-white border-b border-navy-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-transparent.png" alt="DecentralLearn" className="h-8 w-auto object-contain" />
            <span className="hidden sm:inline-block text-xs font-bold text-navy-700 bg-navy-100 px-2.5 py-0.5 rounded-full">
              DSA Diagnostic Assessment
            </span>
          </div>

          {/* Timers & Counters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-600 bg-navy-50 border border-navy-200 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>{formatTime(totalSeconds)}</span>
            </div>

            <button
              onClick={onExit}
              className="text-xs text-navy-400 hover:text-navy-700 transition-colors py-1 px-2"
            >
              Exit to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Question Container ───────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 flex flex-col justify-center">

        {/* Progress Tracker */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-navy-600 mb-1.5">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="h-2 bg-navy-200/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white border border-navy-200 rounded-2xl shadow-card p-6 sm:p-10">

          {/* Question Metadata Tags */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1 rounded-lg">
                Topic: {currentQ.topic}
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase border ${
                currentQ.difficulty === 'easy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : currentQ.difficulty === 'medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {currentQ.difficulty}
              </span>
            </div>

            <div className="text-[11px] font-medium text-navy-400 flex items-center gap-1">
              <span>Time on question:</span>
              <strong className="text-navy-700">{formatTime(currentQSeconds)}</strong>
            </div>
          </div>

          {/* Question Prompt */}
          <h2 className="text-lg sm:text-xl font-bold text-navy-900 leading-snug mb-8">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQ.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx)
              const isSelected = currentSelected === option

              return (
                <div
                  key={option}
                  onClick={() => handleSelectOption(option)}
                  className={`cursor-pointer border rounded-xl p-4 transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/50 shadow-sm ring-1 ring-brand-600'
                      : 'border-navy-200 bg-white hover:border-navy-300 hover:bg-navy-50/40'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-brand-600 text-white'
                      : 'bg-navy-100 text-navy-700'
                  }`}>
                    {letter}
                  </span>
                  <span className={`text-sm leading-relaxed pt-0.5 ${
                    isSelected ? 'font-bold text-navy-900' : 'text-navy-800'
                  }`}>
                    {option}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Question Footer Controls */}
          <div className="pt-6 border-t border-navy-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>
              )}
              <button
                type="button"
                onClick={handleSkipQuestion}
                className="text-xs text-navy-500 hover:text-navy-800 px-3 py-2 rounded-lg hover:bg-navy-50 font-medium transition-colors"
              >
                Skip Question
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextOrSubmit}
              disabled={isSubmitting}
              className="btn-primary px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Computing Results…
                </>
              ) : currentIndex === questions.length - 1 ? (
                <>
                  Submit Diagnostic Assessment <ShieldCheck className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next Question <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Indicator note */}
        <p className="text-center text-[11px] text-navy-400 mt-4">
          Attempt count tracked: {currentAttempts} · Answers can be modified before final submission.
        </p>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-navy-400">
        DecentralLearn · Adaptive Diagnostic Assessment Module
      </footer>
    </div>
  )
}
