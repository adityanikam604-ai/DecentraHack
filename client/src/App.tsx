import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import DiagnosticAssessmentPage from './pages/DiagnosticAssessmentPage'

export default function App() {
  const { user, loading, profileLoading, hasCompletedOnboarding } = useAuth()
  const [currentView, setCurrentView] = useState<'main' | 'diagnostic'>('main')

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
  } else {
    mainElement = (
      <DashboardPage
        onStartDiagnostic={() => setCurrentView('diagnostic')}
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

