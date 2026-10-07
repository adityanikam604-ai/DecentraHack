import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { LearnerProfile } from '../types'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  learnerProfile: LearnerProfile | null
  profileLoading: boolean
  hasCompletedOnboarding: boolean
  refreshProfile: () => Promise<void>
  setProfileLocally: (profile: LearnerProfile) => void
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                                 = useState<User | null>(null)
  const [session, setSession]                           = useState<Session | null>(null)
  const [loading, setLoading]                           = useState(true)
  const [learnerProfile, setLearnerProfile]             = useState<LearnerProfile | null>(null)
  const [profileLoading, setProfileLoading]             = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  const loadProfile = async (userId: string) => {
    setProfileLoading(true)
    try {
      // Instant cache check
      const cached = localStorage.getItem(`decentrallearn_profile_${userId}`)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed && parsed.learning_goals && parsed.interests && parsed.interests.length > 0) {
            setLearnerProfile(parsed)
            setHasCompletedOnboarding(true)
          }
        } catch {
          // ignore cache parse error
        }
      }

      const { data, error } = await supabase
        .from('learner_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (!error && data && data.learning_goals && data.interests && data.interests.length > 0) {
        setLearnerProfile(data)
        setHasCompletedOnboarding(true)
        localStorage.setItem(`decentrallearn_profile_${userId}`, JSON.stringify(data))
      } else if (!cached) {
        setLearnerProfile(null)
        setHasCompletedOnboarding(false)
      }
    } catch (e) {
      console.error('Failed to load learner profile:', e)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)
      if (currentUser?.id) {
        loadProfile(currentUser.id)
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)
      if (currentUser?.id) {
        loadProfile(currentUser.id)
      } else {
        setLearnerProfile(null)
        setHasCompletedOnboarding(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshProfile = async () => {
    if (user?.id) {
      await loadProfile(user.id)
    }
  }

  const setProfileLocally = (profile: LearnerProfile) => {
    setLearnerProfile(profile)
    setHasCompletedOnboarding(true)
    if (user?.id) {
      localStorage.setItem(`decentrallearn_profile_${user.id}`, JSON.stringify(profile))
    }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setLearnerProfile(null)
    setHasCompletedOnboarding(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        learnerProfile,
        profileLoading,
        hasCompletedOnboarding,
        refreshProfile,
        setProfileLocally,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

