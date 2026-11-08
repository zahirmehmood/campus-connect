import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '@/services'
import type { SignUpResult } from '@/services/contracts'
import type { RegistrationInput, UserProfile } from '@/types'

interface AuthContextValue {
  user: UserProfile | null
  initializing: boolean
  signIn: (email: string, password: string) => Promise<UserProfile>
  signUp: (input: RegistrationInput) => Promise<SignUpResult>
  confirmSignUp: (email: string, code: string, password: string) => Promise<UserProfile>
  resendSignUpCode: (email: string) => Promise<void>
  signOut: () => Promise<void>
  syncUser: (user: UserProfile) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let active = true
    authService.restoreSession()
      .then((restored) => { if (active) setUser(restored) })
      .finally(() => { if (active) setInitializing(false) })
    return () => { active = false }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const authenticated = await authService.signIn(email, password)
    setUser(authenticated)
    return authenticated
  }, [])

  const signUp = useCallback(async (input: RegistrationInput) => {
    const result = await authService.signUp(input)
    if (result.status === 'signed-in') setUser(result.user)
    return result
  }, [])

  const confirmSignUp = useCallback(async (email: string, code: string, password: string) => {
    const confirmed = await authService.confirmSignUp(email, code, password)
    setUser(confirmed)
    return confirmed
  }, [])

  const resendSignUpCode = useCallback((email: string) => authService.resendSignUpCode(email), [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, initializing, signIn, signUp, confirmSignUp, resendSignUpCode, signOut, syncUser: setUser }), [user, initializing, signIn, signUp, confirmSignUp, resendSignUpCode, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
