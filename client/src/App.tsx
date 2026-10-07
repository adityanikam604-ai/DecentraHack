import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import DiagnosticAssessmentPage from './pages/DiagnosticAssessmentPage'
import LearningContentPage from './pages/LearningContentPage'
import PracticePage from './pages/PracticePage'

export default function App() {
  const { user, loading, profileLoading, hasCompletedOnboarding } = useAuth()
  const [currentView, setCurrentView] = useState<'main' | 'diagnostic' | 'learning' | 'practice'>('main')
  const [activeTopicId, setActiveTopicId] = useState<string>('graphs')

  // Spinner while loading Supabase session or initial profile
  if (loading || (user && profileLoading && !hasCompletedOnboarding)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Determine view at single main URL http://localhost:5173/
  let mainElement: React.ReactNode
  if (!user) {
    mainElement = <LoginPage />
  } else if (!hasCompletedOnboarding) {
    mainElement = (
      <OnboardingPage
        onFinish={(startDiagnostic) => {
          if (startDiagnostic) {
            setCurrentView('diagnostic')
          } else {
            setCurrentView('main')
          }
        }}
      />
    )
  } else if (currentView === 'diagnostic') {
    mainElement = (
      <DiagnosticAssessmentPage
        onComplete={() => setCurrentView('main')}
        onExit={() => setCurrentView('main')}
      />
    )
  } else if (currentView === 'learning') {
    mainElement = (
      <LearningContentPage
        initialTopicId={activeTopicId}
        onBackToDashboard={() => setCurrentView('main')}
        onPracticeTopic={(topicId) => {
          setActiveTopicId(topicId)
          setCurrentView('practice')
        }}
      />
    )
  } else if (currentView === 'practice') {
    mainElement = (
      <PracticePage
        initialTopicId={activeTopicId}
        onBackToDashboard={() => setCurrentView('main')}
        onOpenLearningTopic={(topicId) => {
          setActiveTopicId(topicId)
          setCurrentView('learning')
        }}
      />
    )
  } else {
    mainElement = (
      <DashboardPage
        onStartDiagnostic={() => setCurrentView('diagnostic')}
        onOpenTopic={(topicId) => {
          setActiveTopicId(topicId)
          setCurrentView('learning')
        }}
        onStartPractice={(topicId) => {
          if (topicId) setActiveTopicId(topicId)
          setCurrentView('practice')
        }}
      />
    )
  }

  return (
    <Routes>
      {/* 
        ONE main frontend URL only: http://localhost:5173/
        - If not authenticated: shows Login/Signup
        - If authenticated & new user: shows Onboarding
        - If authenticated & onboarded: shows Dashboard
      */}
      <Route path="/" element={mainElement} />

      {/* Internal redirect for any manual URLs back to '/' */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

