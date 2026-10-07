import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { LearnerProfile } from '../types'
import {
  GraduationCap, BookOpen, Layers, Sparkles, Heart,
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, LogOut
} from 'lucide-react'

// ── Step 1: Academic Levels ───────────────────────────────────────────────────
const ACADEMIC_LEVELS = [
  {
    id: 'undergraduate',
    title: 'Undergraduate',
    tag: 'Recommended · Primary MVP Focus',
    description: 'B.Tech / B.E. / BCA / B.Sc engineering & computer science students.',
    icon: '🎓',
  },
  {
    id: 'classes_11_12',
    title: 'Classes 11–12',
    tag: 'Pre-University',
    description: 'Higher secondary students preparing for CS fundamentals & admissions.',
    icon: '🏫',
  },
  {
    id: 'postgraduate',
    title: 'Postgraduate',
    tag: 'Advanced Degree',
    description: 'M.Tech / MCA / MS learners deepening algorithmic problem-solving.',
    icon: '🔬',
  },
  {
    id: 'classes_1_10',
    title: 'Classes 1–10',
    tag: 'Foundational',
    description: 'School students exploring beginner coding and logic foundations.',
    icon: '📘',
  },
]

// ── Step 2: Subjects ──────────────────────────────────────────────────────────
const SUBJECTS = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    badge: 'Primary Subject · Fully Adaptive',
    desc: 'Core computational fundamentals from Arrays to Graphs & Dynamic Programming.',
    icon: '🧮',
    available: true,
  },
  {
    id: 'oop',
    name: 'Object-Oriented Programming',
    badge: 'Coming in Next Milestone',
    desc: 'Classes, inheritance, polymorphism, and scalable software design.',
    icon: '🧱',
    available: false,
  },
  {
    id: 'web-development',
    name: 'Web Development',
    badge: 'Coming in Next Milestone',
    desc: 'Modern full-stack web applications, APIs, and client-server architecture.',
    icon: '🌐',
    available: false,
  },
  {
    id: 'ai-ml',
    name: 'Artificial Intelligence',
    badge: 'Coming in Next Milestone',
    desc: 'Machine learning fundamentals, neural networks, and applied AI systems.',
    icon: '🤖',
    available: false,
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    badge: 'Coming in Next Milestone',
    desc: 'Relational databases, SQL, ACID transactions, and indexing.',
    icon: '🗄️',
    available: false,
  },
  {
    id: 'os',
    name: 'Operating Systems',
    badge: 'Coming in Next Milestone',
    desc: 'Process scheduling, concurrency, virtual memory, and kernel primitives.',
    icon: '💻',
    available: false,
  },
]

// ── Step 3: DSA Topics from PRD ───────────────────────────────────────────────
const DSA_TOPICS = [
  { name: 'Arrays',        slug: 'arrays',       category: 'Linear'      },
  { name: 'Strings',       slug: 'strings',      category: 'Linear'      },
  { name: 'Linked Lists',  slug: 'linked-lists', category: 'Pointers'    },
  { name: 'Stack & Queue', slug: 'stack',        category: 'Abstract'    },
  { name: 'Trees',         slug: 'trees',        category: 'Hierarchical'},
  { name: 'Graphs',        slug: 'graphs',       category: 'Networks'    },
  { name: 'Sorting',       slug: 'sorting',      category: 'Algorithms'  },
  { name: 'Searching',     slug: 'searching',    category: 'Algorithms'  },
]

// ── Step 4: Preferences ───────────────────────────────────────────────────────
const KNOWLEDGE_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    desc: 'New to algorithms or restarting from the fundamental building blocks.',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    desc: 'Know basic data structures, ready to solve medium algorithmic challenges.',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    desc: 'Comfortable with standard algorithms, preparing for high-complexity problems.',
  },
]

const LEARNING_GOALS = [
  'Ace Technical Interviews & Placement Exams',
  'Master College Curriculum & Academic Exams',
  'Build Scalable Real-World Software Projects',
  'Competitive Programming & Contest Preparation',
]

const EXPLANATION_STYLES = [
  {
    id: 'real-world examples',
    label: 'Real-World Examples',
    desc: 'Concrete everyday systems (train networks, gaming, fintech) mapping to concepts.',
  },
  {
    id: 'step-by-step',
    label: 'Step-by-Step Breakdown',
    desc: 'Line-by-line mechanical execution, trace tables, and progressive complexity.',
  },
  {
    id: 'visual',
    label: 'Visual & Diagrams',
    desc: 'Memory cell diagrams, node pointer sketches, and flow illustrations.',
  },
  {
    id: 'theoretical',
    label: 'Theoretical & Mathematical',
    desc: 'Formal invariant proofs, recurrence relations, and big-O analysis.',
  },
]

// ── Step 5: Relatable Interests (from PRD) ────────────────────────────────────
const INTEREST_DOMAINS = [
  {
    id: 'railway',
    label: 'Railway & Transit Networks',
    analogy: 'Stations = Nodes · Tracks = Edges · Travel time = Weights',
    icon: '🚆',
  },
  {
    id: 'gaming',
    label: 'Gaming & Game Development',
    analogy: 'Game maps = Graphs · Route finding = Shortest Path · Inventory = Arrays',
    icon: '🎮',
  },
  {
    id: 'fintech',
    label: 'FinTech & Trading Systems',
    analogy: 'Order books = Priority Queues · Stock trends = Sliding Windows',
    icon: '💹',
  },
  {
    id: 'robotics',
    label: 'Robotics & Autonomous Systems',
    analogy: 'Obstacle avoidance = BFS/DFS · Sensor logs = Circular Buffers',
    icon: '🤖',
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce & Logistics',
    analogy: 'Package routing = Minimum Spanning Trees · Cart = Linked Lists',
    icon: '🛒',
  },
  {
    id: 'space',
    label: 'Space & Astronomy',
    analogy: 'Planetary orbits = Cyclic Graphs · Telemetry packets = Queues',
    icon: '🚀',
  },
  {
    id: 'social-media',
    label: 'Social Media & Networks',
    analogy: 'Friends & Followers = Directed Graphs · Feed sorting = Heaps',
    icon: '📱',
  },
  {
    id: 'cinema',
    label: 'Cinema & Streaming',
    analogy: 'Recommendation engines = Matrix Graphs · Video buffers = Queues',
    icon: '🎬',
  },
]

interface OnboardingPageProps {
  onFinish?: (startDiagnostic?: boolean) => void
}

export default function OnboardingPage({ onFinish }: OnboardingPageProps = {}) {
  const { user, signOut, setProfileLocally } = useAuth()

  // Stepper state (1 to 5)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Step 1: Academic Level
  const [educationLevel, setEducationLevel] = useState<'undergraduate' | 'classes_11_12' | 'postgraduate' | 'classes_1_10'>('undergraduate')

  // Step 2: Subject
  const [selectedSubject] = useState('dsa')

  // Step 3: Topics (Strengths & Needs Practice)
  const [strengths, setStrengths] = useState<string[]>(['Arrays', 'Strings'])
  const [needsPractice, setNeedsPractice] = useState<string[]>(['Graphs', 'Trees'])

  // Step 4: Preferences
  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [learningGoal, setLearningGoal] = useState('Ace Technical Interviews & Placement Exams')
  const [preferredExplanation, setPreferredExplanation] = useState<'real-world examples' | 'step-by-step' | 'visual' | 'theoretical'>('real-world examples')
  const [difficultyPreference, setDifficultyPreference] = useState<'easy' | 'medium' | 'hard'>('medium')

  // Step 5: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['railway', 'gaming'])

  // Helper toggle functions
  const toggleStrength = (topicName: string) => {
    if (strengths.includes(topicName)) {
      setStrengths(s => s.filter(x => x !== topicName))
    } else {
      setStrengths(s => [...s, topicName])
      setNeedsPractice(p => p.filter(x => x !== topicName))
    }
  }

  const togglePractice = (topicName: string) => {
    if (needsPractice.includes(topicName)) {
      setNeedsPractice(p => p.filter(x => x !== topicName))
    } else {
      setNeedsPractice(p => [...p, topicName])
      setStrengths(s => s.filter(x => x !== topicName))
    }
  }

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(i => i.filter(x => x !== id))
      }
    } else {
      setSelectedInterests(i => [...i, id])
    }
  }

  // Handle final completion
  const handleComplete = async (startDiagnostic: boolean = false) => {
    if (!user) return
    setIsSubmitting(true)
    setErrorMsg(null)

    const profileData: LearnerProfile = {
      user_id: user.id,
      education_level: educationLevel,
      current_level: currentLevel,
      interests: selectedInterests,
      preferred_explanation: preferredExplanation,
      strengths: strengths.length > 0 ? strengths : ['Arrays'],
      needs_practice: needsPractice.length > 0 ? needsPractice : ['Graphs'],
      difficulty_preference: difficultyPreference,
      learning_goals: learningGoal,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }

    try {
      // 1. Save learner profile in Supabase
      const { error: profileError } = await supabase
        .from('learner_profiles')
        .upsert({
          user_id: profileData.user_id,
          education_level: profileData.education_level,
          current_level: profileData.current_level,
          interests: profileData.interests,
          preferred_explanation: profileData.preferred_explanation,
          strengths: profileData.strengths,
          needs_practice: profileData.needs_practice,
          difficulty_preference: profileData.difficulty_preference,
          learning_goals: profileData.learning_goals,
          updated_at: profileData.updated_at,
        }, { onConflict: 'user_id' })

      if (profileError) {
        console.warn('Note on learner_profiles upsert:', profileError)
      }

      // 2. Map learner to subject (DSA)
      const { data: dsaSubject } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'dsa')
        .maybeSingle()

      if (dsaSubject?.id) {
        await supabase
          .from('learner_subjects')
          .upsert({
            user_id: user.id,
            subject_id: dsaSubject.id,
          }, { onConflict: 'user_id,subject_id' })
      }

      // 3. Initialize baseline learning_progress for topics
      const { data: dbTopics } = await supabase
        .from('topics')
        .select('id, name, slug')
        .order('order_index')

      if (dbTopics && dbTopics.length > 0) {
        const progressRecords = dbTopics.map(t => {
          const isStrong = profileData.strengths.includes(t.name)
          const isPractice = profileData.needs_practice.includes(t.name)
          const pct = isStrong ? 88 : isPractice ? 38 : 68
          const mastery = isStrong ? 85 : isPractice ? 35 : 65
          return {
            user_id: user.id,
            topic_id: t.id,
            progress_percentage: pct,
            mastery_score: mastery,
            completed: isStrong,
          }
        })

        await supabase
          .from('learning_progress')
          .upsert(progressRecords, { onConflict: 'user_id,topic_id' })
      }

      // 4. Update local context state so App.tsx displays Dashboard immediately
      setProfileLocally(profileData)
      if (onFinish) {
        onFinish(startDiagnostic)
      }
    } catch (err: any) {
      console.error('Error during onboarding save:', err)
      // Even if network blips, allow fallback via local cache
      setProfileLocally(profileData)
      if (onFinish) {
        onFinish(startDiagnostic)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(s => s + 1)
    else handleComplete(false)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1)
  }

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col justify-between">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <header className="bg-white border-b border-navy-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-transparent.png" alt="DecentralLearn" className="h-8 w-auto object-contain" />
            <span className="hidden sm:inline-block text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
              Personalized Setup
            </span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-navy-600">
              Step {currentStep} of 5
            </span>
            <div className="w-24 sm:w-36 h-2 bg-navy-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs text-navy-500 hover:text-navy-800 transition-colors py-1 px-2.5 rounded-md hover:bg-navy-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
        <div className="bg-white border border-navy-200 rounded-2xl shadow-card p-6 sm:p-10">

          {/* Error Banner */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3.5 mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── STEP 1: Academic Level ──────────────────────────────── */}
          {currentStep === 1 && (
            <div>
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-2">
                  <GraduationCap className="w-4 h-4" /> Academic Stage
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                  What is your current education level?
                </h1>
                <p className="text-sm text-navy-500 mt-1.5">
                  DecentralLearn adapts explanation depth, difficulty, and problem models to your academic stage.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {ACADEMIC_LEVELS.map(lvl => {
                  const isSelected = educationLevel === lvl.id
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => setEducationLevel(lvl.id as any)}
                      className={`cursor-pointer border rounded-xl p-5 transition-all relative ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/40 shadow-sm ring-1 ring-brand-600'
                          : 'border-navy-200 bg-white hover:border-navy-300 hover:bg-navy-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <span className="text-3xl">{lvl.icon}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-navy-900 text-base">{lvl.title}</h3>
                        <span className="text-[11px] font-semibold text-brand-700 bg-brand-100/70 px-2 py-0.5 rounded">
                          {lvl.tag}
                        </span>
                      </div>
                      <p className="text-xs text-navy-500 leading-relaxed">{lvl.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── STEP 2: Subject Selection ───────────────────────────── */}
          {currentStep === 2 && (
            <div>
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-4 h-4" /> Curriculum Subject
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                  Choose your learning subject
                </h1>
                <p className="text-sm text-navy-500 mt-1.5">
                  For the MVP hackathon, our adaptive engine is deeply specialized in Data Structures & Algorithms.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {SUBJECTS.map(sub => {
                  const isSelected = selectedSubject === sub.id
                  return (
                    <div
                      key={sub.id}
                      className={`border rounded-xl p-5 relative transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/40 shadow-sm ring-1 ring-brand-600'
                          : sub.available
                          ? 'border-navy-200 hover:border-navy-300 cursor-pointer'
                          : 'border-navy-200 opacity-60 bg-navy-50/40 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{sub.icon}</span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-navy-900 text-base mb-1">{sub.name}</h3>
                      <p className="text-xs text-navy-500 mb-2 leading-relaxed">{sub.desc}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        sub.available ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-navy-100 text-navy-500'
                      }`}>
                        {sub.badge}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── STEP 3: Topic Selection & Comfort Level ──────────────── */}
          {currentStep === 3 && (
            <div>
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-2">
                  <Layers className="w-4 h-4" /> Topic Diagnostics
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                  Where do you stand in DSA?
                </h1>
                <p className="text-sm text-navy-500 mt-1.5">
                  Mark topics you already know (Strengths) and topics where you want focused practice.
                </p>
              </div>

              <div className="space-y-3">
                {DSA_TOPICS.map(topic => {
                  const isStrong = strengths.includes(topic.name)
                  const isPractice = needsPractice.includes(topic.name)

                  return (
                    <div
                      key={topic.slug}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-navy-200 rounded-xl hover:bg-navy-50/50 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-brand-500" />
                        <div>
                          <span className="font-bold text-navy-900 text-sm">{topic.name}</span>
                          <span className="text-xs text-navy-400 ml-2">({topic.category})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleStrength(topic.name)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            isStrong
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400'
                              : 'bg-white text-navy-600 border-navy-200 hover:border-navy-300'
                          }`}
                        >
                          {isStrong ? '✓ Strong Topic' : '+ Mark as Strong'}
                        </button>
                        <button
                          type="button"
                          onClick={() => togglePractice(topic.name)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            isPractice
                              ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-400'
                              : 'bg-white text-navy-600 border-navy-200 hover:border-navy-300'
                          }`}
                        >
                          {isPractice ? '⚠ Needs Practice' : '+ Needs Practice'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 p-3.5 bg-navy-50 border border-navy-200 rounded-xl flex items-center justify-between text-xs text-navy-600">
                <span>Selected: <strong className="text-emerald-700">{strengths.length} strong</strong>, <strong className="text-amber-700">{needsPractice.length} needing practice</strong></span>
                <span className="text-navy-400">You can adjust this anytime</span>
              </div>
            </div>
          )}

          {/* ── STEP 4: Learning Preferences ────────────────────────── */}
          {currentStep === 4 && (
            <div>
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4" /> Personalization Model
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                  How do you learn best?
                </h1>
                <p className="text-sm text-navy-500 mt-1.5">
                  Select your knowledge level, goal, and preferred explanation approach.
                </p>
              </div>

              {/* Part 1: Current Level */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-2">
                  Current Knowledge Level
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {KNOWLEDGE_LEVELS.map(lvl => (
                    <div
                      key={lvl.id}
                      onClick={() => setCurrentLevel(lvl.id as any)}
                      className={`cursor-pointer border rounded-xl p-3.5 transition-all ${
                        currentLevel === lvl.id
                          ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-600'
                          : 'border-navy-200 hover:border-navy-300'
                      }`}
                    >
                      <h4 className="font-bold text-navy-900 text-sm mb-1">{lvl.label}</h4>
                      <p className="text-[11px] text-navy-500 leading-snug">{lvl.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part 2: Learning Goal */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-2">
                  Primary Learning Goal
                </label>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {LEARNING_GOALS.map(goal => (
                    <div
                      key={goal}
                      onClick={() => setLearningGoal(goal)}
                      className={`cursor-pointer border rounded-lg px-3.5 py-3 text-xs font-medium transition-all ${
                        learningGoal === goal
                          ? 'border-brand-600 bg-brand-50/60 text-brand-900 font-bold'
                          : 'border-navy-200 text-navy-700 hover:border-navy-300'
                      }`}
                    >
                      {goal}
                    </div>
                  ))}
                </div>
              </div>

              {/* Part 3: Explanation Style */}
              <div>
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider mb-2">
                  Preferred Explanation Style
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {EXPLANATION_STYLES.map(style => (
                    <div
                      key={style.id}
                      onClick={() => setPreferredExplanation(style.id as any)}
                      className={`cursor-pointer border rounded-xl p-3.5 transition-all ${
                        preferredExplanation === style.id
                          ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-600'
                          : 'border-navy-200 hover:border-navy-300'
                      }`}
                    >
                      <h4 className="font-bold text-navy-900 text-xs mb-1">{style.label}</h4>
                      <p className="text-[11px] text-navy-500 leading-snug">{style.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Interests (Relatable Analogies) ──────────────── */}
          {currentStep === 5 && (
            <div>
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-2">
                  <Heart className="w-4 h-4" /> Contextual Analogies
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                  What real-world domains interest you?
                </h1>
                <p className="text-sm text-navy-500 mt-1.5">
                  DecentralLearn anchors complex technical concepts to what you care about.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5 mb-6">
                {INTEREST_DOMAINS.map(item => {
                  const isSelected = selectedInterests.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleInterest(item.id)}
                      className={`cursor-pointer border rounded-xl p-4 transition-all relative ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-600 shadow-sm'
                          : 'border-navy-200 hover:border-navy-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{item.icon}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <h4 className="font-bold text-navy-900 text-sm mb-1">{item.label}</h4>
                      <p className="text-[11px] text-navy-500 font-mono bg-navy-50/80 px-2 py-1 rounded">
                        {item.analogy}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Difficulty Preference */}
              <div className="p-4 bg-navy-50 border border-navy-200 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                      Initial Practice Difficulty
                    </h4>
                    <p className="text-xs text-navy-500 mt-0.5">
                      System dynamically scales up or down based on your attempts.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(['easy', 'medium', 'hard'] as const).map(diff => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficultyPreference(diff)}
                        className={`px-3 py-1.5 text-xs font-bold capitalize rounded-lg border transition-all ${
                          difficultyPreference === diff
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-navy-600 border-navy-200 hover:border-navy-300'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Footer Navigation Buttons ───────────────────────────── */}
          <div className="mt-10 pt-6 border-t border-navy-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="btn-secondary flex items-center gap-2 px-5 py-2.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep === 5 ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleComplete(false)}
                  disabled={isSubmitting}
                  className="btn-secondary px-4 py-2.5 text-xs font-semibold"
                >
                  Skip to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => handleComplete(true)}
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 text-xs font-semibold shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving Profile…
                    </>
                  ) : (
                    <>
                      Take Diagnostic Assessment <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-xs font-semibold"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </main>

      {/* ── Bottom Footer ─────────────────────────────────────────── */}
      <footer className="text-center py-4 text-xs text-navy-400">
        DecentralLearn · Adaptive Academic Learning Platform
      </footer>
    </div>
  )
}
