// User & Auth
export interface User {
  id: string
  email: string
  created_at: string
}

// Learner Profile
export interface LearnerProfile {
  id?: string
  user_id: string
  education_level: 'classes_1_10' | 'classes_11_12' | 'undergraduate' | 'postgraduate'
  current_level: 'beginner' | 'intermediate' | 'advanced'
  interests: string[]
  preferred_explanation: 'real-world examples' | 'theoretical' | 'visual' | 'step-by-step'
  strengths: string[]
  needs_practice: string[]
  difficulty_preference: 'easy' | 'medium' | 'hard'
  learning_goals: string
  created_at?: string
  updated_at?: string
}

// Subject & Topic
export interface Subject {
  id: string
  name: string
  slug: string
  description: string
  icon: string
}

export interface Topic {
  id: string
  subject_id: string
  name: string
  slug: string
  order_index: number
  prerequisites: string[]
}

// Progress
export interface LearnerProgress {
  id: string
  user_id: string
  topic_id: string
  progress_percentage: number
  mastery_score: number
  completed: boolean
  updated_at: string
}

// Assessment
export interface AssessmentQuestion {
  id: string
  topic_id: string
  question: string
  options: string[]
  correct_answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'mcq' | 'conceptual' | 'coding' | 'scenario'
}

export interface AssessmentAttempt {
  question_id: string
  user_answer: string
  correct: boolean
  time_taken: number
  hints_used: number
  attempts: number
}

// Certificate
export interface Certificate {
  id: string
  user_id: string
  subject_id: string
  certificate_id: string
  mastery_score: number
  issued_at: string
  blockchain_hash?: string
  blockchain_verified: boolean
}

// Adaptive UI Config
export interface UIPreferences {
  font_size: 'small' | 'medium' | 'large'
  density: 'low' | 'medium' | 'high'
  content_per_page: number
  hints_enabled: boolean
  visual_mode: boolean
}

// Learner Model (in-memory / state)
export interface LearnerModel {
  educationLevel: LearnerProfile['education_level']
  subject: string
  currentLevel: LearnerProfile['current_level']
  interests: string[]
  preferredExplanation: LearnerProfile['preferred_explanation']
  strengths: string[]
  needsPractice: string[]
  difficultyPreference: LearnerProfile['difficulty_preference']
}
